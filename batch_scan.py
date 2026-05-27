#!/usr/bin/env python3
# batch_scan.py - Headless CLI Batch Scanner with Local Vector DB RAG
import os
import sys
import glob
import json
import argparse
import subprocess
import urllib.request
from datetime import datetime
import chromadb
from crewai import Agent, Task, Crew, Process, LLM
from crewai.tools import tool

import re

# 1. CLI 인자 파서 정의
def parse_arguments():
    parser = argparse.ArgumentParser(description="AI-DLC Headless CLI Batch Scanner")
    parser.add_argument(
        "--dir", 
        type=str, 
        default="./input", 
        help="리뷰를 진행할 대상 소스코드 디렉토리 경로 (기본값: ./input)"
    )
    parser.add_argument(
        "--patch",
        action="store_true",
        help="컨벤션을 100% 준수한 AI 리팩토링 코드를 원본 소스 파일에 직접 덮어씌워 패치합니다."
    )
    parser.add_argument(
        "--max-spend",
        type=float,
        default=999.0,
        help="에이전트가 소모할 수 있는 최대 비용 한도(USD). 누적 비용이 이 한도를 초과하면 비상 차단됩니다."
    )
    return parser.parse_args()

def extract_refactored_code(report_text: str) -> str:
    """리포트 마크다운 텍스트에서 '### 🛠️ 리팩토링 제안 코드' 이후의 파이썬 코드 블록을 추출합니다."""
    split_keyword = "### 🛠️ 리팩토링 제안 코드"
    if split_keyword in report_text:
        target_section = report_text.split(split_keyword)[1]
    else:
        target_section = report_text

    # ```python\n ... ``` 패턴 매칭
    pattern = r"```python\n(.*?)```"
    match = re.search(pattern, target_section, re.DOTALL)
    if match:
        return match.group(1).strip()
    return ""

def check_git_status() -> bool:
    """Git 작업 영역에 변경 사항이 있는지 확인합니다."""
    try:
        status_output = subprocess.check_output(
            ["git", "status", "--porcelain"], 
            stderr=subprocess.STDOUT
        ).decode("utf-8").strip()
        return len(status_output) > 0
    except subprocess.CalledProcessError:
        return False

def get_github_repository() -> Optional[str]:
    """GitHub 레포지토리 이름(owner/repo)을 추출합니다."""
    # 1. GHA 환경변수 우선 조회
    repo = os.environ.get("GITHUB_REPOSITORY")
    if repo:
        return repo
    
    # 2. 로컬 git remote에서 추출
    try:
        remote_url = subprocess.check_output(
            ["git", "config", "--get", "remote.origin.url"]
        ).decode("utf-8").strip()
        if "github.com" in remote_url:
            parts = remote_url.split("github.com")[1]
            parts = parts.replace(".git", "").strip("/")
            if parts.startswith(":"):
                parts = parts[1:]
            return parts
    except Exception:
        pass
    return None

def run_git_automation(target_dir: str) -> Optional[str]:
    """변경된 사항이 있으면 브랜치를 생성하고, 커밋 및 원격 깃허브 저장소로 푸시합니다."""
    if not check_git_status():
        print("ℹ️ [Git 자동화]: 변경된 코드 사항이 없어 브랜치 생성을 건너뜁니다.")
        return None

    # 고유 브랜치 이름 생성 (ai-refactor-YYYYMMDD-HHMMSS)
    branch_name = f"ai-refactor-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    print(f"\n🚀 [Git 자동화]: 변경 사항 감지! 새로운 브랜치 '{branch_name}' 생성을 시작합니다.")

    try:
        # GitHub Actions 환경에서의 시스템 봇 계정 정보 설정
        if os.environ.get("GITHUB_ACTIONS"):
            subprocess.check_call(["git", "config", "user.name", "github-actions[bot]"])
            subprocess.check_call(["git", "config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com"])

        # 브랜치 생성 및 체크아웃
        subprocess.check_call(["git", "checkout", "-b", branch_name])
        
        # 전체 스테이징 및 커밋 수행
        subprocess.check_call(["git", "add", "."])
        commit_msg = "[AI-Refactor] Apply company conventions to code base automatically"
        subprocess.check_call(["git", "commit", "-m", commit_msg])
        
        # 원격 저장소로 푸시
        subprocess.check_call(["git", "push", "origin", branch_name])
        print(f"✅ [Git 자동화]: 브랜치 원격 저장소 푸시 완료: {branch_name}")
        return branch_name
    except subprocess.CalledProcessError as e:
        print(f"❌ [Git 자동화 에러]: Git 커맨드 실행 실패 (에러: {e})")
        return None

def create_github_pull_request(branch_name: str, pr_title: str, pr_body: str) -> Optional[str]:
    """GitHub REST API를 사용하여 Pull Request를 자동으로 발행합니다."""
    repo = get_github_repository()
    token = os.environ.get("GITHUB_TOKEN")
    
    if not repo:
        print("⚠️ [PR 자동 생성]: 레포지토리 정보를 가져오지 못해 PR 생성을 건너뜁니다.")
        return None
    
    if not token:
        print("⚠️ [PR 자동 생성]: GITHUB_TOKEN 환경 변수가 없어 PR 생성을 건너뜁니다. (이 플로우는 GitHub Actions CI에서 정상 작동합니다)")
        return None
        
    api_url = f"https://api.github.com/repos/{repo}/pulls"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json"
    }
    
    data = {
        "title": pr_title,
        "body": pr_body,
        "head": branch_name,
        "base": "main"
    }
    
    try:
        req = urllib.request.Request(
            api_url, 
            data=json.dumps(data).encode("utf-8"), 
            headers=headers, 
            method="POST"
        )
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            pr_url = res_data.get("html_url")
            print(f"\n🎉 [PR 자동 생성 성공]: Pull Request가 정상적으로 발행되었습니다!")
            print(f"🔗 PR URL: {pr_url}")
            return pr_url
    except Exception as e:
        print(f"❌ [PR 자동 생성 실패]: GitHub REST API 호출 오류 (에러: {e})")
        if hasattr(e, "read"):
            try:
                print(f"상세 에러 내용: {e.read().decode('utf-8')}")
            except Exception:
                pass
        return None


def calculate_cumulative_spend(usage_file="token_usage_history.txt") -> float:
    """token_usage_history.txt를 파싱하여 프로젝트의 총 누적 지출 금액(USD)을 환산해냅니다."""
    if not os.path.exists(usage_file):
        return 0.0
        
    total_prompt = 0
    total_completion = 0
    
    try:
        with open(usage_file, "r", encoding="utf-8") as rf:
            for line in rf:
                if "Prompt (Input) Tokens :" in line:
                    try:
                        tokens = int(line.split("Prompt (Input) Tokens :")[1].strip().replace(" tokens", ""))
                        total_prompt += tokens
                    except Exception:
                        pass
                elif "Completion (Output) Tokens :" in line:
                    try:
                        tokens = int(line.split("Completion (Output) Tokens :")[1].strip().replace(" tokens", ""))
                        total_completion += tokens
                    except Exception:
                        pass
    except Exception as e:
        print(f"⚠️ [비용 계산기 경고]: 토큰 사용량 이력 파일 파싱 실패 (에러: {e})")
        
    # Gemini 2.5 Flash 기준: Input $0.075/1M, Output $0.30/1M
    prompt_cost = (total_prompt / 1000000) * 0.075
    completion_cost = (total_completion / 1000000) * 0.30
    return prompt_cost + completion_cost

def enable_github_auto_merge(pr_url: str) -> bool:
    """GitHub CLI (gh)를 사용하여 생성된 Pull Request에 Auto-Merge를 활성화합니다."""
    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        print("⚠️ [Auto-Merge]: GITHUB_TOKEN 환경 변수가 없어 Auto-Merge 활성화를 건너뜁니다.")
        return False
        
    try:
        print(f"\n🔄 [Auto-Merge]: 생성된 PR ({pr_url})에 대해 자동 병합(Auto-Merge) 활성화를 시도합니다...")
        cmd = ["gh", "pr", "merge", pr_url, "--auto", "--merge"]
        
        env = os.environ.copy()
        env["GH_TOKEN"] = token
        
        # gh CLI 실행
        subprocess.check_call(cmd, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print("✅ [Auto-Merge]: Pull Request 자동 병합(Auto-Merge)이 활성화 상태로 설정되었습니다!")
        return True
    except Exception as e:
        print(f"⚠️ [Auto-Merge 실패]: GitHub CLI를 통해 Auto-Merge를 설정할 수 없습니다 (원인: {e})")
        print(" 💡 레포지토리 Settings에서 'Allow auto-merge' 옵션이 켜져 있는지 확인해 주세요.")
        return False


# 2. API 키 검증 및 고품질 LLM 초기화 (503 에러 방어형 지수 백오프)
if not os.environ.get("GEMINI_API_KEY"):
    print("❌ 에러: GEMINI_API_KEY 환경 변수가 설정되지 않았습니다!")
    sys.exit(1)

gemini_model = LLM(
    model=os.environ.get("GEMINI_MODEL", "gemini/gemini-2.5-flash"),
    api_key=os.environ.get("GEMINI_API_KEY"),  # 💡 api_key를 명시적으로 주입하여 환경변수 누락 버그 방어
    temperature=0.1,
    max_retries=10,  # 프레임워크 레벨 재시도 10회
    extra_kwargs={
        "client_options": {
            "num_retries": 10,         # RPC 채널 재시도 10회
            "retry_delay_mult": 2.0,   # 지수 백오프 배수
            "initial_retry_delay": 3.0 # 최초 대기 3초
        }
    }
)

# 3. 로컬 가벼운 파일 기반 Vector DB (ChromaDB) 인프라 세팅
chroma_client = chromadb.PersistentClient(path="./chroma_db_storage")
collection = chroma_client.get_or_create_collection(name="team_conventions")

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
                        
                    collection.upsert(
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

# 4. Advanced Vector DB RAG 검색 툴 정의
@tool("advanced_vector_rag_tool")
def advanced_vector_rag_tool(query: str) -> str:
    """사내 Vector DB에서 소스코드의 맥락과 가장 유사도가 높은 컨벤션 가이드 원문을 쿼리하여 검색해옵니다."""
    results = collection.query(
        query_texts=[query],
        n_results=2
    )
    flattened_docs = "\n\n".join(results['documents'][0]) if results['documents'] else "일치하는 사내 규정 없음"
    return flattened_docs

# 5. 에이전트(Agents) 결성
retriever = Agent(
    role="컨텍스트 검색 에이전트",
    goal="분석할 코드를 보고 사내 문서에서 관련된 컨벤션 규칙을 찾아온다.",
    backstory="팀의 모든 위키와 소스코드 스타일 가이드를 벡터화하여 검색해내는 맥락 아키텍트.",
    tools=[advanced_vector_rag_tool],
    llm=gemini_model,
    verbose=True
)

reviewer = Agent(
    role="시니어 코드 리뷰어",
    goal="제출된 코드가 검색된 사내 컨벤션 규칙을 잘 지켰는지 검증하여 취약점과 위반 사항을 찾아낸다.",
    backstory="10년 차 깐깐한 시니어 풀스택 개발자. 팀의 잠재적 버그를 물고 늘어지는 완벽주의 리뷰어.",
    llm=gemini_model,
    verbose=True
)

writer = Agent(
    role="리팩토링 아키텍트",
    goal="리뷰 피드백을 반영하여 컨벤션을 100% 준수한 최종 마크다운 리포트와 코드를 생성한다.",
    backstory="리리뷰어의 매서운 피드백을 수용하여 개발자가 복사해서 바로 붙일 수 있는 완전한 무결성 코드를 짜내는 전문가.",
    llm=gemini_model,
    verbose=True
)

def run_batch_scan(target_dir, is_patch=False, max_spend=999.0):
    # 6. 대상 파일 탐색 및 스캔 가드
    if not os.path.exists(target_dir) or not os.path.isdir(target_dir):
        print(f"❌ 에러: 지정된 경로 '{target_dir}'가 존재하지 않거나 디렉토리가 아닙니다.")
        sys.exit(1)
        
    all_files = glob.glob(os.path.join(target_dir, "**", "*.py"), recursive=True)
    py_files = [f for f in all_files if "venv" not in f and ".venv" not in f and "__pycache__" not in f]
    
    if not py_files:
        print(f"ℹ️ 알림: '{target_dir}' 내에 스캔 가능한 파이썬 파일이 존재하지 않습니다.")
        sys.exit(0)
        
    print(f"🔍 총 {len(py_files)}개의 파이썬 파일을 발견하여 분석을 시작합니다.")
    
    local_result_buffer = {}
    total_prompt, total_completion, total_combined = 0, 0, 0
    total_files = len(py_files)
    
    # 7. 순차 연쇄 루프 가동
    for idx, file_path in enumerate(py_files):
        file_name = os.path.basename(file_path)
        
        # 🚨 [Spend Guardrail]: 루프 가동 전 누적 지출 금액 실시간 검사
        current_spend = calculate_cumulative_spend("token_usage_history.txt")
        if max_spend is not None and current_spend >= max_spend:
            print(f"\n🛑 [지출 상한 가드레일 비상 셧다운]:")
            print(f" ⚠️ 현재 프로젝트 누적 청구 금액 (${current_spend:.5f} USD)이 설정된 최대 허용 비용 한도 (${max_spend:.5f} USD)를 초과했습니다.")
            print(f" 🛑 추가적인 Gemini API 호출을 원천 차단하고 안전하게 스캔 파이프라인을 비상 정지합니다.")
            if idx == 0:
                sys.exit(0)
            else:
                break
                
        print(f"\n⚡ [{idx+1}/{total_files}] '{file_name}' 파일 스캔 개시...")
        
        with open(file_path, "r", encoding="utf-8") as f:
            file_content = f.read()
            
        task_retrieve = Task(
            description=f"다음 분석 대상 파일({file_name}) 코드를 검토하고 규칙을 검색하세요. 핵심 규칙 번호와 제목만 요약해 주세요. \n\n[대상 코드]:\n{file_content}", 
            expected_output="사내 규칙 가이드라인 리스트", 
            agent=retriever
        )
        task_review = Task(
            description=f"검색된 사내 규칙들과 대상 파일({file_name}) 코드를 정밀 비교하여 위반 사항 리스트를 작성하세요. 서론/결론 생략. \n\n[대상 코드]:\n{file_content}", 
            expected_output="간결한 위반 항목 요약", 
            agent=reviewer
        )
        task_refactor = Task(
            description=f"이전 단계에서 검출된 위반 사항을 사내 규칙에 맞게 완벽히 수정한 '{file_name}'의 '리팩토링 코드'를 작성하고 리포트를 뽑아내세요. \n\n[대상 코드]:\n{file_content}", 
            expected_output=f"## 🚨 코드 리뷰 보고서 (`{file_name}`)\n- **결과 총평**: (짧은 한 줄 요약)\n### 🔍 주요 위반 규정 및 원인 분석\n(위반 내용 기술)\n### 🛠️ 리팩토링 제안 코드\n```python\n# 여기에 수정된 완전한 소스코드를 작성하세요\n```", 
            agent=writer
        )

        dlc_crew = Crew(
            agents=[retriever, reviewer, writer], 
            tasks=[task_retrieve, task_review, task_refactor], 
            process=Process.sequential
        )
        
        # 503 과부하 방어용 자동 지수 백오프 (최대 8회 시도, 최초 10초 대기)
        import time
        file_result_obj = None
        max_attempts = 8
        backoff_delay = 10
        
        for attempt in range(max_attempts):
            try:
                file_result_obj = dlc_crew.kickoff()
                break
            except Exception as e:
                # 503 UNAVAILABLE, 429 Rate Limit, None or empty response, 네트워크 끊김 모두 방어
                err_msg = str(e).upper()
                retry_keywords = [
                    "503", "UNAVAILABLE", "429", "RATE_LIMIT", "DEMAND", "DISCONNECTED", 
                    "REMOTEPROTOCOL", "CONNECTION", "SERVER", "NONE OR EMPTY", "INVALID RESPONSE", "EMPTY"
                ]
                if any(x in err_msg for x in retry_keywords):
                    print(f"⚠️ [Gemini API 오류/네트워크 장애 감지] {attempt+1}회차 실패 (에러: {str(e)[:150]}). {backoff_delay}초 대기 후 자동으로 재시도합니다...")
                    time.sleep(backoff_delay)
                    backoff_delay = min(backoff_delay * 2, 60) # 최대 60초 대기 제한
                else:
                    raise e
                    
        if file_result_obj is None:
            raise RuntimeError(f"❌ 구글 API 서버 과부하 지속으로 인해 '{file_name}' 스캔에 실패했습니다.")
            
        print(f"✅ '{file_name}' 분석 및 리팩토링 보고서 도출 완료.")
        local_result_buffer[file_name] = str(file_result_obj)
        
        # 7-1. 원본 파일 자율 패치 모듈 (--patch 옵션이 활성화된 경우)
        if is_patch:
            refactored_code = extract_refactored_code(str(file_result_obj))
            if refactored_code:
                with open(file_path, "w", encoding="utf-8") as wf:
                    wf.write(refactored_code)
                print(f"🛠️ [자율 패치]: '{file_name}' 파일에 리팩토링 코드를 직접 덮어씌워 패치 완료!")
            else:
                print(f"⚠️ [자율 패치 경고]: '{file_name}' 리포트에서 리팩토링 제안 코드 블록을 추출하지 못했습니다.")
        
        # Free Tier RPM (Requests Per Minute) 방어를 위해 파일 처리 완료 후 15초 쿨다운
        if idx < len(py_files) - 1:
            print("⏳ [API 쿨다운] 다음 파일 분석 전, Gemini API RPM(분당 호출수) 제한 방지를 위해 15초 동안 대기합니다...")
            time.sleep(15)
        
        # 사용량 수집
        m = getattr(file_result_obj, "usage_metrics", None)
        if m:
            total_prompt += m.get("prompt_tokens", 0) if isinstance(m, dict) else getattr(m, "prompt_tokens", 0)
            total_completion += m.get("completion_tokens", 0) if isinstance(m, dict) else getattr(m, "completion_tokens", 0)
            total_combined += m.get("total_tokens", 0) if isinstance(m, dict) else getattr(m, "total_tokens", 0)
        else:
            total_combined += 1500; total_prompt += 1000; total_completion += 500

    # 8. 최종 마스터 리포트 파일 저장
    # 마크다운 통합 보고서 생성
    combined_report_md = "# 🚨 AI 일괄 코드 리뷰 통합 결과 보고서\n"
    combined_report_md += f"- **분석 경로:** `{target_dir}`\n"
    combined_report_md += f"- **분석 일시:** `{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}`\n"
    combined_report_md += f"- **대상 파일:** 총 `{total_files}`개 파일 스캔\n\n"
    combined_report_md += "## 📊 종합 품질 현황표\n"
    combined_report_md += "| 번호 | 파일명 | 스캔 상태 | 결과 상세 |\n| :---: | :--- | :---: | :--- |\n"
    for i, name in enumerate(local_result_buffer.keys()):
        combined_report_md += f"| {i+1} | `{name}` | ✅ 완료 | 아래 상세 세션 확인 |\n"
    combined_report_md += "\n---\n\n"
    
    for name, content in local_result_buffer.items():
        combined_report_md += f"{content}\n\n---\n\n"

    # 파일로 로컬 저장 (GHA 아티팩트 및 스크립트 출력용)
    output_filename = "code_review_report.md"
    with open(output_filename, "w", encoding="utf-8") as f:
        f.write(combined_report_md)
    print(f"\n💾 [마스터 인프라]: 최종 통합 리뷰 리포트를 파일로 정상 박제 완료: {output_filename}")
    
    # JSON 원천 데이터 백업 저장
    with open("total_code_review_report.json", "w", encoding="utf-8") as f:
        json.dump(local_result_buffer, f, ensure_ascii=False, indent=2)
        
    # 8-1. Git 자동화 및 PR 생성 (is_patch가 활성화되어 있고 Git 변경 사항이 있는 경우)
    if is_patch:
        branch_name = run_git_automation(target_dir)
        if branch_name:
            pr_title = f"[AI-Refactor] 사내 규정 준수 자동 리팩토링 ({datetime.now().strftime('%Y-%m-%d')})"
            pr_url = create_github_pull_request(branch_name, pr_title, combined_report_md)
            if pr_url:
                enable_github_auto_merge(pr_url)
        
    # 9. 토큰 지표 영구 기록 및 모니터링 누적
    current_time_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    usage_file = "token_usage_history.txt"
    
    cumulative_total = 0
    if os.path.exists(usage_file):
        with open(usage_file, "r", encoding="utf-8") as rf:
            lines = rf.readlines()
            for line in reversed(lines):
                if "Cumulative Total:" in line:
                    try:
                        cumulative_total = int(line.split("Cumulative Total:")[1].strip().replace(" tokens", ""))
                        break
                    except ValueError:
                        pass
                        
    cumulative_total += total_combined
    
    with open(usage_file, "a", encoding="utf-8") as af:
        af.write(f"[{current_time_str}] -------------------------------\n")
        af.write(f" - Prompt (Input) Tokens : {total_prompt} tokens\n")
        af.write(f" - Completion (Output) Tokens : {total_completion} tokens\n")
        af.write(f" - This Run Total Tokens : {total_combined} tokens\n")
        af.write(f" - Cumulative Total: {cumulative_total} tokens\n\n")
        
    print("\n==================================================")
    print("📊 [토큰 사용량 정밀 모니터링 모듈]")
    print("==================================================")
    print(f"📈 이번 배치 소모 토큰 : {total_combined:,} tokens")
    print(f"🔌 프로젝트 누적 소모량: {cumulative_total:,} tokens")
    print("==================================================")

if __name__ == "__main__":
    args = parse_arguments()
    print("🚀 Headless CLI 배치 스캔 엔진 가동 시작...")
    run_batch_scan(args.dir, args.patch, args.max_spend)
