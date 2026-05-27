# app_dev_ui.py - Streamlit Dashboard for Autonomous Software Engineering (SWE-Agent)
import os
import re
import sys
import glob
import json
from datetime import datetime
import chromadb
import streamlit as st
from crewai import Agent, Task, Crew, Process, LLM
from crewai.tools import tool
import time

# 1. 스트림릿 웹 페이지 설정
st.set_page_config(page_title="AI-DLC SWE-Agent Portal", page_icon="🤖", layout="wide")

st.title("🤖 AI-DLC: 자율 소프트웨어 엔지니어링 포털 (SWE-Agent)")
st.caption("Google I/O 2026 Agentic Workflow & Multi-File Autonomous Coding Architecture")

# 2. API 키 설정 및 LLM 초기화
if not os.environ.get("GEMINI_API_KEY"):
    st.error("❌ GEMINI_API_KEY 환경 변수가 세팅되지 않았습니다. zsh 터미널에서 export 해주세요.")
    st.stop()

gemini_model = LLM(
    model=os.environ.get("GEMINI_MODEL", "gemini/gemini-2.5-flash"),
    api_key=os.environ.get("GEMINI_API_KEY"),  # 💡 api_key를 명시적으로 주입하여 환경변수 누락 버그 방어
    temperature=0.1,
    max_retries=10,  # 프레임워크 레벨 재시도를 10회로 상향
    extra_kwargs={
        "client_options": {
            "num_retries": 10,       # 구글 RPC 채널 자체 재시도 10회 강제
            "retry_delay_mult": 2.0,  # 지수 백오프 배수
            "initial_retry_delay": 3.0 # 최초 대기 시간 3초 지정
        }
    }
)

# ====================================================================
# 💾 [데이터 레이어] 로컬 ChromaDB 및 유틸 연동
# ====================================================================
chroma_client = chromadb.PersistentClient(path="./chroma_db_storage")
convention_col = chroma_client.get_or_create_collection(name="team_conventions")
history_col = chroma_client.get_or_create_collection(name="review_history")

def seed_convention_data():
    """사내 컨벤션과 에이전트 개발 가이드를 정밀 파싱(Chunking & Tagging)하여 로컬 Vector DB에 증분 빌드합니다."""
    files_to_seed = {
        "company_convention.md": "doc_rule",
        "agent_development_guide.md": "doc_guide"
    }
    
    for filename, prefix in files_to_seed.items():
        if os.path.exists(filename):
            try:
                with open(filename, "r", encoding="utf-8") as f:
                    content = f.read()
                
                # 마크다운 헤더(## 또는 ###) 기준으로 청킹
                raw_chunks = re.split(r"(?=###? )", content)
                chunks = [c.strip() for c in raw_chunks if c.strip()]
                
                for i, chunk in enumerate(chunks):
                    # 💡 자율 메타데이터 태그 분석 엔진 (Tagging)
                    metadata = {"source": filename}
                    chunk_lower = chunk.lower()
                    
                    # Language & Framework 판별
                    if any(x in chunk_lower for x in ["python", "fastapi", "sqlalchemy", "pytest"]):
                        metadata["language"] = "python"
                        metadata["framework"] = "fastapi"
                    elif any(x in chunk_lower for x in ["typescript", "next.js", "nextjs", "zod", "react"]):
                        metadata["language"] = "typescript"
                        metadata["framework"] = "nextjs"
                        
                    # Layer 판별
                    if any(x in chunk_lower for x in ["transaction", "lock", "db.begin", "deadlock", "원자성"]):
                        metadata["layer"] = "transaction"
                    elif any(x in chunk_lower for x in ["security", "xss", "injection", "masking", "보안"]):
                        metadata["layer"] = "security"
                    elif any(x in chunk_lower for x in ["test", "pytest", "unit", "mock"]):
                        metadata["layer"] = "test"
                    elif any(x in chunk_lower for x in ["architecture", "clean", "layer"]):
                        metadata["layer"] = "architecture"
                        
                    convention_col.upsert(
                        documents=[chunk],
                        metadatas=[metadata],
                        ids=[f"{prefix}_{i}"]
                    )
                print(f"✅ [ChromaDB 인프라]: '{filename}' 지식 문서를 정밀 임베딩(Chunking & Tagging)하여 Vector DB에 동기화 완료했습니다.")
            except Exception as e:
                print(f"⚠️ [ChromaDB 시딩 실패]: '{filename}' 시딩 오류 (원인: {e})")
        else:
            print(f"⚠️ 경고: '{filename}' 지식 문서가 존재하지 않아 시딩을 건너뜁니다.")

# 최초 실행 시 데이터 빌드
seed_convention_data()

@tool("advanced_vector_rag_tool")
def advanced_vector_rag_tool(query: str) -> str:
    """사내 Vector DB에서 소스코드의 맥락과 가장 유사도가 높은 컨벤션 가이드 원문을 쿼리하여 검색해옵니다."""
    results = convention_col.query(query_texts=[query], n_results=2)
    return "\n\n".join(results['documents'][0]) if results['documents'] else "일치하는 사내 규정 없음"

def check_code_laziness(content: str) -> bool:
    """에이전트가 작성한 코드 본문에 생략 주석이 들어있는지 정밀하게 정규식 스캔합니다.
    생략 징후 발견 시 True를 반환합니다.
    """
    lazy_patterns = [
        r"#\s*\.\.\.\s*기존\s*코드",
        r"#\s*기존\s*코드",
        r"#\s*\.\.\.\s*생략",
        r"#\s*\.\.\.\s*중략",
        r"//\s*\.\.\.\s*기존\s*코드",
        r"//\s*\.\.\.\s*생략",
        r"//\s*\.\.\.\s*중략",
        r"#\s*\.\.\.\s*로직",
        r"//\s*\.\.\."
    ]
    for pattern in lazy_patterns:
        if re.search(pattern, content, re.IGNORECASE):
            return True
    return False

# 3. 로컬 파일 자율 패치 모듈
def extract_and_apply_multi_patches(coder_output: str, default_dir: str = "./input") -> dict:
    import re
    applied_files = {}
    # 💡 [유연한 정규식 스캐너]: 대괄호 선택형 매칭 및 다중 소스 확장자 허용 스펙 적용
    pattern = r"#### FILE:\s*\[?(.*?)\]?\s*```(?:python|typescript|tsx|json|javascript|js|py|sh)?\n(.*?)\n```"
    matches = re.findall(pattern, coder_output, re.DOTALL)
    
    if not matches:
        # 혹시 FILE 패턴 매칭이 안되었을 때를 대비한 단일 파일 폴백 파서
        single_pattern = r"```(?:python|typescript|tsx|json|javascript|js|py|sh)?\n(.*?)\n```"
        match = re.search(single_pattern, coder_output, re.DOTALL)
        if match:
            fallback_path = os.path.join(default_dir, "generated_service.py")
            applied_files[fallback_path] = match.group(1).strip()
    else:
        for file_path, code_content in matches:
            clean_path = file_path.strip()
            applied_files[clean_path] = code_content.strip()
            
    return applied_files

# ====================================================================
# 🧠 [상태 관리] 세션 상태 메모리 격리 구조
# ====================================================================
if "swe_result_report" not in st.session_state:
    st.session_state.swe_result_report = ""
if "swe_patched_files" not in st.session_state:
    st.session_state.swe_patched_files = {}
if "selected_path" not in st.session_state:
    st.session_state.selected_path = os.path.join(os.getcwd(), "src")

usage_file = "token_usage_history.txt"

# ====================================================================
# 🏛️ UI 레이아웃 배치
# ====================================================================
col_input, col_result = st.columns(2)

with col_input:
    st.subheader("📁 1단계: 개발 대상 디렉토리 및 요구사항 지시")
    
    dir_path = st.text_input(
        "개발 대상 로컬 폴더 절대 경로:", 
        value=st.session_state.selected_path
    )
    st.session_state.selected_path = dir_path
    
    # 자연어 개발 요청 지시창
    task_prompt = st.text_area(
        "📝 에이전트에게 내릴 신규 기능 개발 명령을 자연어로 작성하세요:",
        value="Next.js App Router를 사용하여 사용자 프로필 조회 화면(src/app/profile/page.tsx)을 개발해줘. Zod를 활용해 서버 컴포넌트 데이터 검증 및 폰트/이미지 최적화 가이드라인(agent_development_guide.md)을 엄수해야 해.",
        height=150,
        help="예: 'Next.js 프로필 페이지 추가해줘', 'Zod 회원가입 폼 작성해줘' 등 비즈니스 요구사항 입력"
    )
    
    # 가드레일 슬라이더
    st.markdown("🔒 **API 지출 예방 가드레일**")
    max_spend_limit = st.slider(
        "최대 허용 비용 한도 (USD)", 
        min_value=0.5, 
        max_value=50.0, 
        value=5.0, 
        step=0.5,
        key="dev_max_spend_limit"
    )
    
    # 패치 토글
    is_patch = st.checkbox(
        "🛠️ **자율 패치 활성화** (체크 시 코드가 파일 시스템에 즉시 생성/수정 반영됨)",
        value=True
    )
    
    # 수집 가드라인
    py_files = []
    if os.path.exists(st.session_state.selected_path) and os.path.isdir(st.session_state.selected_path):
        all_files = glob.glob(os.path.join(st.session_state.selected_path, "**", "*.py"), recursive=True)
        py_files = [f for f in all_files if "venv" not in f and ".venv" not in f and "__pycache__" not in f]
    
    run_button = st.button("🚀 자율 신규 개발 및 패치 개시", use_container_width=True, disabled=len(task_prompt.strip()) == 0)
    st.markdown("---")
    
    # 📊 실시간 프로젝트 인프라 지표
    st.subheader("📊 실시간 프로젝트 인프라 지표 (정밀 정산)")
    
    def calculate_infra_metrics():
        run_count = 0
        last_run_tokens = 0
        total_prompt_tokens = 0
        total_completion_tokens = 0
        if os.path.exists(usage_file):
            with open(usage_file, "r", encoding="utf-8") as rf:
                for line in rf:
                    if "---" in line: run_count += 1
                    if "Prompt (Input) Tokens :" in line:
                        try: total_prompt_tokens += int(line.split("Prompt (Input) Tokens :")[1].strip().replace(" tokens", ""))
                        except: pass
                    if "Completion (Output) Tokens :" in line:
                        try: total_completion_tokens += int(line.split("Completion (Output) Tokens :")[1].strip().replace(" tokens", ""))
                        except: pass
                    if "This Run Total Tokens :" in line:
                        try: last_run_tokens = int(line.split("This Run Total Tokens :")[1].strip().replace(" tokens", ""))
                        except: pass
        
        prompt_cost = (total_prompt_tokens / 1000000) * 0.075
        completion_cost = (total_completion_tokens / 1000000) * 0.30
        total_accumulated_cost = prompt_cost + completion_cost
        total_cumulative_tokens = total_prompt_tokens + total_completion_tokens
        return run_count, last_run_tokens, total_cumulative_tokens, total_accumulated_cost
 
    runs, last_tokens, total_tokens, total_cost = calculate_infra_metrics()
    
    col_m1, col_m2 = st.columns(2)
    with col_m1:
        st.metric(label="🔄 총 자율 가동 횟수", value=f"{runs} 회차")
        st.metric(label="⏱️ 직전 회차 소모 토큰", value=f"{last_tokens:,} Tokens")
    with col_m2:
        st.metric(label="🔌 누적 소모 토큰", value=f"{total_tokens:,} Tokens")
        st.metric(label="💰 누적 인프라 예상 비용", value=f"${total_cost:.5f} USD")

# ====================================================================
# 🚀 백그라운드 에이전트 자율 코딩 프로세스
# ====================================================================
if run_button and task_prompt:
    with col_result:
        st.subheader("🤖 AI 에이전트 자율 기획 및 코딩 결과")
        
        progress_bar = st.progress(0.0)
        status_box = st.status("🚀 SWE-Agent 자율 개발 요구사항 분석 중...", expanded=True)
        
        with st.spinner("4인의 에이전트가 협업하여 기획 및 코딩을 수행 중입니다..."):
            try:
                # 🚨 [Spend Guardrail]: 시작 전 누적 요금 비상 점검
                _, _, _, current_cost = calculate_infra_metrics()
                if current_cost >= max_spend_limit:
                    status_box.update(label="🛑 [지출 가드레일 비상 셧다운] 예산 한도 초과", state="error")
                    st.error(f"🛑 **[비상 정지]** 현재 누적 청구 금액 (${current_cost:.5f} USD)이 설정하신 한도 (${max_spend_limit:.5f} USD)를 초과하여 작동을 원천 차단했습니다.")
                    st.stop()
                
                # 에이전트 로컬 튜브
                class StatusSubstream:
                    def write(self, message):
                        if sys.__stdout__ is not None:
                            sys.__stdout__.write(message)
                        msg_stripped = message.strip()
                        if msg_stripped and not any(x in msg_stripped for x in ["[1m", "[0m", "进入", "Task"]):
                            if "Thinking:" in msg_stripped:
                                status_box.write(f"🧠 **에이전트 사고:** {msg_stripped.replace('Thinking:', '').strip()}")
                            elif "Using Tool:" in msg_stripped:
                                status_box.write(f"🔧 **RAG 쿼리 중:** {msg_stripped.replace('Using Tool:', '').strip()}")
                    def flush(self):
                        if sys.__stdout__ is not None:
                            sys.__stdout__.flush()
                            
                # 에이전트 생성
                planner = Agent(role="수석 요구사항 분석가 및 기획자 (Requirements Planner)", goal="요구사항 분석 후 기획 명세 수립", backstory="자연어를 완벽한 아키텍처 명세서로 변형하는 노련한 아키텍트.", llm=gemini_model)
                retriever = Agent(role="컨텍스트 RAG 검색 전문가 (Context Retriever)", goal="사내 컨벤션 검색", backstory="스타일 가이드를 외우는 RAG 페르소나.", tools=[advanced_vector_rag_tool], llm=gemini_model)
                coder = Agent(role="자율 신규 개발 코더 (Auto-Coder)", goal="사내 규정 준수 고품질 코딩", backstory="규정에 딱 맞춘 클린 코드를 작성하는 전문 개발자.", llm=gemini_model)
                validator = Agent(
                    role="시니어 품질 및 규정 검증 리뷰어 (Senior Reviewer)",
                    goal="작성된 코드를 검수하여 명세 미반영이 없는지, 컨벤션을 위배하지 않는지 정밀 비교 심사하고 코드의 영향도와 위험성을 평가하여 수동 머지 여부를 자율 판단한다.",
                    backstory="10년 차 깐깐한 시니어 테크 리드. 코드가 안전한 예외처리를 다 담았는지 검증하고, 영향도가 높은 민감 코드(결제, DB 스키마, 보안 인증, 개인정보 취급 등)일 경우 수동 리뷰를 강제하는 완벽주의 조율자.",
                    llm=gemini_model
                )

                # 기존 코드 맥락
                existing_files = glob.glob(os.path.join(st.session_state.selected_path, "**", "*.py"), recursive=True)
                existing_tree = "\n".join([f" - {os.path.relpath(x)}" for x in existing_files]) if existing_files else " (기존 파일 없음)"
                
                status_box.write("📋 **1. 기획 에이전트 구동 개시:** 요구사항 명세서 작성 중...")
                task_plan = Task(
                    description=f"개발자의 자연어 요구사항에 맞추어 기능 기획 설계서를 작성하세요.\n\n[개발 요구사항]:\n{task_prompt}\n\n[현재 프로젝트 파일 트리]:\n{existing_tree}\n\n반드시 '#### FILE: [파일명]' 형식으로 어떤 파일을 새로 생성하고 어떤 파일을 수정해야 하는지 계획서에 명시하세요.",
                    expected_output="기능 상세 설계 명세서 및 파일 생성/수정 계획 리스트",
                    agent=planner
                )
                
                task_retrieve = Task(
                    description=f"작성된 기획 설계를 바탕으로 사내 규정 RAG DB에서 지켜야 할 가이드를 쿼리하세요. \n\n[기능 설계서]:\n{{task_plan.output}}",
                    expected_output="사내 규정 및 스타일 준수 가이드 리스트",
                    agent=retriever
                )
                
                task_code = Task(
                    description=f"기능 설계서와 스타일 가이드를 결합하여 무결한 소스코드를 작성하세요.\n\n반드시 다음의 '멀티 파일 패치 양식'을 정확히 엄수해 출력하세요:\n\n#### FILE: [적용할 파일 절대경로 또는 상대경로]\n```python\n# 여기에 파일의 100% 완전한 전체 소스코드를 작성하세요\n```",
                    expected_output="규정을 100% 만족하는 코딩 완료 포맷",
                    agent=coder
                )
                
                task_validate = Task(
                    description=f"코드를 시니어 테크 리드 입장에서 정밀 검수하고 보정해 아래의 '최종 멀티 파일 패치 양식'만 엄격히 출력하세요. 서론/인사말 절대 제외.\n\n# 🚨 AI 자율 기능 개발 완료 리포트\n\n## 📋 개발 스펙 요약\n(스펙 요약)\n\n## 🔒 위험도 자율 평가 및 안전 조치\n- **[위험도 평가]**: (HIGH 또는 LOW - DB 스키마 변경, 결제, 권한, 보안, 개인정보 마스킹, 전역 클래스 등 주요 기능 변경 시 HIGH로 자율 명시)\n- **사유:** (HIGH/LOW 지정 사유 기술)\n\n## 🛠️ 자율 생성/수정 코드 목록\n\n#### FILE: [적용할 파일 경로]\n```python\n(100% 전체 소스코드)\n```",
                    expected_output="최종 검증 완료된 자율 패치용 리포트 마크다운",
                    agent=validator
                )

                swe_crew = Crew(
                    agents=[planner, retriever, coder, validator],
                    tasks=[task_plan, task_retrieve, task_code, task_validate],
                    process=Process.sequential
                )
                
                file_result_obj = None
                max_attempts = 3
                backoff_delay = 5
                
                for attempt in range(max_attempts):
                    old_stdout = sys.stdout
                    sys.stdout = StatusSubstream()
                    try:
                        file_result_obj = swe_crew.kickoff()
                        break
                    except Exception as crew_error:
                        sys.stdout = old_stdout
                        err_msg = str(crew_error).upper()
                        retry_keywords = [
                            "503", "UNAVAILABLE", "429", "RATE_LIMIT", "DEMAND", "DISCONNECTED", 
                            "REMOTEPROTOCOL", "CONNECTION", "SERVER", "NONE OR EMPTY", "INVALID RESPONSE", "EMPTY"
                        ]
                        if any(x in err_msg for x in retry_keywords):
                            status_box.write(f"⚠️ **[API 지연/장애 감지]** {attempt+1}회차 실패. {backoff_delay}초 후 자동으로 재시도합니다...")
                            time.sleep(backoff_delay)
                            backoff_delay = min(backoff_delay * 2, 60)
                        else:
                            raise crew_error
                    finally:
                        sys.stdout = old_stdout
                
                if file_result_obj is None:
                    status_box.update(label="❌ 자율 개발 도중 치명적 에러 발생", state="error")
                    raise RuntimeError("구글 API 서버 과부하 지속으로 인한 자율 개발 실패.")
                
                progress_bar.progress(0.8)
                status_box.write("🛠️ **자율 패치 모듈 가동:** 소스코드 파일 시스템 물리 갱신 중...")
                
                report_text = str(file_result_obj)
                st.session_state.swe_result_report = report_text
                
                # 파일 생성/수정 적용
                patched_files = {}
                if is_patch:
                    patched_files = extract_and_apply_multi_patches(report_text, st.session_state.selected_path)
                    st.session_state.swe_patched_files = patched_files
                    if patched_files:
                        # 💡 [나태함 자율 방어 가드레일]: 물리 패치 직전 모든 파일의 생략 주석 존재 여부를 전수 조사!
                        has_lazy_omission = False
                        for filepath, content in patched_files.items():
                            if check_code_laziness(content):
                                status_box.write(f"🛑 **[자율 패치 거부 - 원본 보호]:** '{os.path.basename(filepath)}'에 생략 주석('# 기존 코드' 또는 '// ...')이 발견되어 물리 덮어쓰기를 비활성화 차단했습니다!")
                                has_lazy_omission = True
                        
                        if not has_lazy_omission:
                            for filepath, content in patched_files.items():
                                dir_name = os.path.dirname(filepath)
                                if dir_name and not os.path.exists(dir_name):
                                    os.makedirs(dir_name, exist_ok=True)
                                with open(filepath, "w", encoding="utf-8") as wf:
                                    wf.write(content)
                                status_box.write(f"✅ **[파일 자율 갱신 완수]:** '{os.path.basename(filepath)}'")
                        else:
                            st.warning("⚠️ 에이전트의 나태함(생략 주석)이 감지되어 원본 소스 보호를 위해 덮어쓰기를 취소하고 안전하게 스킵했습니다. 리포트의 완성본을 확인하거나 완전히 다시 써주도록 지시해 주세요.")
                
                progress_bar.progress(1.0)
                status_box.update(label="🎉 자율 개발 및 로컬 소스코드 패치 완료!", state="complete", expanded=False)
                
                # 사용량 누적 기록
                total_prompt, total_completion, total_combined = 0, 0, 0
                m = getattr(file_result_obj, "usage_metrics", None)
                if m:
                    total_prompt = m.get("prompt_tokens", 0) if isinstance(m, dict) else getattr(m, "prompt_tokens", 0)
                    total_completion = m.get("completion_tokens", 0) if isinstance(m, dict) else getattr(m, "completion_tokens", 0)
                    total_combined = m.get("total_tokens", 0) if isinstance(m, dict) else getattr(m, "total_tokens", 0)
                else:
                    total_combined = 2000; total_prompt = 1500; total_completion = 500
                
                current_time_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                with open(usage_file, "a", encoding="utf-8") as af:
                    af.write(f"[{current_time_str}] -------------------------------\n")
                    af.write(f" - Prompt (Input) Tokens : {total_prompt} tokens\n")
                    af.write(f" - Completion (Output) Tokens : {total_completion} tokens\n")
                    af.write(f" - This Run Total Tokens : {total_combined} tokens\n\n")
                
                # 결과 리포트 저장
                with open("code_review_report.md", "w", encoding="utf-8") as f:
                    f.write(report_text)
                    
                st.success("🎉 요구사항 자율 개발 완수! 우측 패널에서 생성된 코드 및 리포트를 검토하세요.")
                st.rerun()
                
            except Exception as e:
                status_box.update(label="❌ 자율 개발 실패", state="error")
                st.error(f"❌ 에러 발생: {str(e)}")

# ====================================================================
# 🎨 우측 결과 렌더링 존 (개발 완성 프리뷰 탭)
# ====================================================================
with col_result:
    if st.session_state.swe_result_report:
        st.info("🎯 **자율 신규 개발 산출물 프리뷰**")
        
        file_keys = list(st.session_state.swe_patched_files.keys())
        tab_titles = ["📝 자율 개발 완료 리포트"] + [f"💻 {os.path.basename(k)}" for k in file_keys]
        tabs = st.tabs(tab_titles)
        
        # 1. 리포트 탭
        with tabs[0]:
            st.markdown(st.session_state.swe_result_report)
            
        # 2. 개별 코드 파일 탭
        for i, filepath in enumerate(file_keys):
            with tabs[i + 1]:
                st.caption(f"💾 파일 물리 경로: `{filepath}`")
                st.code(st.session_state.swe_patched_files[filepath], language="python")
    else:
        st.info("👈 좌측에서 자연어 개발 명령을 입력하고 개시 단추를 누르면, 여기에 기획 설계 리포트 및 자율 코딩된 파일들이 시각화됩니다.")
