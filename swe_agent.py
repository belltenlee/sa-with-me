#!/usr/bin/env python3
# swe_agent.py - Autonomous Software Engineering Agent with Local RAG & Auto-Merge CD
import os
import sys
import glob
import json
import argparse
import subprocess
import urllib.request
import re
from datetime import datetime
from typing import Optional
import chromadb
from crewai import Agent, Task, Crew, Process, LLM
from crewai.tools import tool

# 1. CLI 인자 파서 정의
def parse_arguments():
    parser = argparse.ArgumentParser(description="AI-DLC Autonomous SWE-Agent")
    parser.add_argument(
        "--task",
        type=str,
        required=True,
        help="에이전트가 스스로 분석, 기획, 코딩하여 배포할 자연어 개발 요구사항"
    )
    parser.add_argument(
        "--dir", 
        type=str, 
        default="./input", 
        help="개발 및 스캔 대상 소스코드 디렉토리 경로 (기본값: ./input)"
    )
    parser.add_argument(
        "--patch",
        action="store_true",
        help="에이전트가 작성한 신규 및 수정 소스 코드를 파일 시스템에 직접 덮어씌우거나 신규 생성합니다."
    )
    parser.add_argument(
        "--max-spend",
        type=float,
        default=999.0,
        help="에이전트가 소모할 수 있는 최대 비용 한도(USD). 누적 비용이 이 한도를 초과하면 비상 차단됩니다."
    )
    parser.add_argument(
        "--no-auto-merge",
        action="store_true",
        help="에이전트가 PR 생성 후 자동 병합(Auto-Merge)을 수행하지 않고 수동 승인 모드로 강제 우회합니다."
    )
    return parser.parse_args()


# 2. 멀티 파일 패치 정밀 파서 엔진
def extract_and_apply_multi_patches(coder_output: str, default_dir: str = "./input") -> dict:
    """
    에이전트 출력 리포트에서 FILE: [경로]와 코드 블록을 탐색하여 멀티 파일 패치를 수행합니다.
    대괄호([])가 있든 없든, 다양한 소스 확장자(python, tsx, typescript, json 등)를 지니든 모두 정밀하게 감지합니다.
    """
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

# 3. 누적 지출 계산기 (Spend Guardrail)
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

# 4. Git 자동화 및 PR / Auto-Merge
def check_git_status() -> bool:
    try:
        status_output = subprocess.check_output(
            ["git", "status", "--porcelain"], 
            stderr=subprocess.STDOUT
        ).decode("utf-8").strip()
        return len(status_output) > 0
    except subprocess.CalledProcessError:
        return False

def get_github_repository() -> Optional[str]:
    repo = os.environ.get("GITHUB_REPOSITORY")
    if repo:
        return repo
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

def run_git_automation(target_dir: str, task_prompt: str = "") -> Optional[str]:
    if not check_git_status():
        print("ℹ️ [Git 자동화]: 변경된 개발 코드 사항이 없어 브랜치 생성을 건너뜁니다.")
        return None

    branch_name = f"ai-dev-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    print(f"\n🚀 [Git 자동화]: 자율 신규 개발 코드 변경 사항 감지! 브랜치 '{branch_name}' 생성을 시작합니다.")

    try:
        if os.environ.get("GITHUB_ACTIONS"):
            subprocess.check_call(["git", "config", "user.name", "github-actions[bot]"])
            subprocess.check_call(["git", "config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com"])

        subprocess.check_call(["git", "checkout", "-b", branch_name])
        subprocess.check_call(["git", "add", "."])
        
        # 💡 [커밋 메시지 동적 명명]: 무의미한 미사여구 대신, 실제 요구사항 제목을 커밋에 동적 기입!
        clean_prompt = "Apply conventions and developments"
        if task_prompt:
            temp_prompt = re.sub(r'\[AI-Dev\]', '', task_prompt, flags=re.IGNORECASE).strip()
            lines = [line.strip() for line in temp_prompt.split('\n') if line.strip()]
            if lines:
                clean_prompt = lines[0]
            if len(clean_prompt) > 50:
                clean_prompt = clean_prompt[:50] + "..."
        commit_msg = f"[AI-Dev] {clean_prompt}"
        
        subprocess.check_call(["git", "commit", "-m", commit_msg])
        subprocess.check_call(["git", "push", "origin", branch_name])
        print(f"✅ [Git 자동화]: 신규 브랜치 원격 저장소 푸시 완료: {branch_name}")
        return branch_name
    except subprocess.CalledProcessError as e:
        print(f"❌ [Git 자동화 에러]: Git 커맨드 실행 실패 (에러: {e})")
        return None

def create_github_pull_request(branch_name: str, pr_title: str, pr_body: str) -> Optional[str]:
    repo = get_github_repository()
    token = os.environ.get("GITHUB_TOKEN")
    
    if not repo or not token:
        print("⚠️ [PR 자동 생성]: 환경 정보 누락으로 PR 발행을 건너뜁니다.")
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
            print(f"\n🎉 [PR 자동 생성 성공]: 신규 개발에 대한 자율 PR이 발행되었습니다: {pr_url}")
            return pr_url
    except Exception as e:
        print(f"❌ [PR 자동 생성 실패]: 깃허브 API 오류 (에러: {e})")
        return None

def enable_github_auto_merge(pr_url: str) -> bool:
    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        return False
    try:
        print(f"\n🔄 [Auto-Merge]: 생성된 PR ({pr_url})에 대해 자동 병합(Auto-Merge) 활성화를 시도합니다...")
        cmd = ["gh", "pr", "merge", pr_url, "--auto", "--merge"]
        env = os.environ.copy()
        env["GH_TOKEN"] = token
        subprocess.check_call(cmd, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print("✅ [Auto-Merge]: Pull Request 자동 병합(Auto-Merge)이 활성화 상태로 설정되었습니다!")
        return True
    except Exception as e:
        print(f"⚠️ [Auto-Merge 실패]: gh CLI를 통한 Auto-Merge 설정 실패 (원인: {e})")
        return False

def check_auto_merge_safety(report_text: str) -> bool:
    """리포트 텍스트 내의 에이전트 자율 위험도 평가 문구를 파싱하여 Auto-Merge 가용 여부를 자율 판정합니다."""
    match = re.search(r"\[위험도 평가\]:\s*(\w+)", report_text, re.IGNORECASE)
    if match:
        risk_level = match.group(1).upper()
        if risk_level == "HIGH":
            print("\n⚠️ [자율 위험도 평가 - HIGH]: DB 스키마, 결제, 보안 등 주요 민감 코드가 변경되어 Auto-Merge를 보류하고 '수동 승인 모드'로 자율 전환합니다.")
            return False
    print("\n✅ [자율 위험도 평가 - LOW]: 영향도가 낮은 안전한 코드 변경으로 판별되어 'Auto-Merge 활성화'를 적용합니다.")
    return True

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

# 5. LLM 및 RAG DB 초기화
if not os.environ.get("GEMINI_API_KEY"):
    print("❌ 에러: GEMINI_API_KEY 환경 변수가 설정되지 않았습니다!")
    sys.exit(1)

gemini_model = LLM(
    model=os.environ.get("GEMINI_MODEL", "gemini/gemini-2.5-flash"),
    api_key=os.environ.get("GEMINI_API_KEY"),
    temperature=0.1,
    max_retries=10,
    extra_kwargs={
        "client_options": {
            "num_retries": 10,
            "retry_delay_mult": 2.0,
            "initial_retry_delay": 3.0
        }
    }
)

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

@tool("advanced_vector_rag_tool")
def advanced_vector_rag_tool(query: str) -> str:
    """사내 Vector DB에서 소스코드의 맥락과 가장 유사도가 높은 컨벤션 가이드 원문을 쿼리하여 검색해옵니다."""
    results = collection.query(query_texts=[query], n_results=2)
    return "\n\n".join(results['documents'][0]) if results['documents'] else "일치하는 사내 규정 없음"

# 6. SWE-Agent 4인조 결성
planner = Agent(
    role="수석 요구사항 분석가 및 기획자 (Requirements Planner)",
    goal="개발자의 자연어 요구사항을 분석하여 파일 변경 정책(신규 생성 또는 수정 대상 파일 경로 도출) 및 세부 기능 명세서를 마크다운으로 자율 수립한다.",
    backstory="고객의 모호한 자연어 요청을 완벽한 파일 시스템 설계서 및 입출력 API 데이터 포맷 명세서로 변형해 내는 노련한 시스템 아키텍트.",
    llm=gemini_model,
    verbose=True
)

retriever = Agent(
    role="컨텍스트 RAG 검색 전문가 (Context Retriever)",
    goal="기획 명세를 만족하기 위해 기존 소스코드 구조 및 사내 규정 가이드에서 최적의 코드 스타일을 쿼리해온다.",
    backstory="사내 표준 문서 위키와 프로젝트 파일 트리를 외우고 있어 알맞은 개발 규정을 찾아내는 RAG 시스템의 인간화 페르소나.",
    tools=[advanced_vector_rag_tool],
    llm=gemini_model,
    verbose=True
)

coder = Agent(
    role="자율 신규 개발 코더 (Auto-Coder)",
    goal="설계 명세서와 RAG 규정 맥락을 결합하여, 사내 컨벤션을 100% 지킨 고품질의 멀티 파일 소스코드를 정밀 코딩한다. 어떠한 경우에도 '# 기존 코드', '# ... 생략'과 같은 주석을 쓰지 않고 100% 완전한 전체 소스코드를 기입하는 것을 신조로 삼는다.",
    backstory="가장 트렌디하고 버그 없는 클린 코드를 작성하는 AI 전문 개발자. 에러 처리를 사내 표준 규격에 정확히 맞추며, 로직을 생략하지 않고 처음부터 끝까지 완전한 전체 소스 코드를 온전하게 작성하는 완벽주의 성향을 가졌다.",
    llm=gemini_model,
    verbose=True
)

validator = Agent(
    role="시니어 품질 및 규정 검증 리뷰어 (Senior Reviewer)",
    goal="작성된 코드를 검수하여 명세 미반영이 없는지, 컨벤션을 위배하지 않는지 정밀 비교 심사하고 코드의 영향도와 위험성을 평가하여 수동 머지 여부를 자율 판단한다.",
    backstory="10년 차 깐깐한 시니어 테크 리드. 코드가 안전한 예외처리를 다 담았는지 검증하고, 영향도가 높은 민감 코드일 경우 수동 리뷰를 강제한다. 특히, 코더가 작성한 최종 소스코드 중에 '# 기존 코드', '// ...' 등의 주석으로 기존 로직을 축약/중략/생략한 행태가 발견되면 극도로 혐오하여 가차 없이 반려시키고 100% 전체 코드를 다시 써오도록 강제하는 깐깐한 테크 거장.",
    llm=gemini_model,
    verbose=True
)

# 💡 [글로벌 자동 병합 제어 기본 설정]
# 환경 변수 'AUTO_MERGE_DEFAULT'가 'false' 또는 '0'이면 위험도 평가가 LOW이더라도 Auto-Merge를 호출하지 않고 수동 승인으로 전환합니다.
AUTO_MERGE_DEFAULT = os.environ.get("AUTO_MERGE_DEFAULT", "true").lower() in ("true", "1", "yes")

def run_swe_agent(task_prompt: str, target_dir="./input", is_patch=False, max_spend=999.0, no_auto_merge=False):
    # 🚨 [Spend Guardrail]: 시작 전 누적 요금 비상 점검
    current_spend = calculate_cumulative_spend("token_usage_history.txt")
    if max_spend is not None and current_spend >= max_spend:
        print(f"\n🛑 [지출 가드레일 비상 셧다운]: 누적 요금 (${current_spend:.5f} USD)이 예산 한도 (${max_spend:.5f} USD)를 초과하여 진입을 전면 차단합니다.")
        sys.exit(0)
        
    print(f"\n🚀 [SWE-Agent 가동]: 자연어 명령 분석 개시...")
    print(f" 📋 개발 명령: '{task_prompt}'\n")

    # 기존 대상 폴더 내 파일 검색 (맥락 수집용)
    existing_files = glob.glob(os.path.join(target_dir, "**", "*.py"), recursive=True)
    existing_tree = "\n".join([f" - {os.path.relpath(x)}" for x in existing_files]) if existing_files else " (기존 파일 없음)"
    
    # 💡 [실시간 코드 맥락 수집 엔진]: 파일의 이름뿐만 아니라 실제 소스코드 내용까지 긁어모아 프레임워크 혼동을 물리적 방어!
    code_context_list = []
    for fpath in existing_files:
        if os.path.isfile(fpath):
            try:
                with open(fpath, "r", encoding="utf-8") as rf:
                    content = rf.read()
                rel_path = os.path.relpath(fpath, target_dir)
                code_context_list.append(f"### [파일 경로: {rel_path}]\n```python\n{content}\n```")
            except Exception:
                pass
    existing_code_context = "\n\n".join(code_context_list) if code_context_list else " (기존 소스코드 내용 없음)"
    
    # 7. 태스크 사슬 정의
    task_plan = Task(
        description=f"개발자가 제시한 다음 자연어 요구사항에 맞추어 기능 기획 설계서를 작성하세요.\n\n[개발 요구사항]:\n{task_prompt}\n\n[기존 소스코드 상세 맥락 (프레임워크 및 구조 분석용)]:\n{existing_code_context}\n\n[현재 프로젝트 파일 트리]:\n{existing_tree}\n\n반드시 기존 프레임워크(FastAPI, Flask 등)와 코딩 스타일을 100% 분석하여 구조적으로 완벽히 일치시켜야 합니다. '#### FILE: [파일명]' 형식으로 어떤 파일을 새로 생성하고 어떤 파일을 수정해야 하는지 파일 수정 및 생성 정책 목록을 설계서에 명시하세요.",
        expected_output="### 📋 기능 상세 설계 명세서 및 파일 생성/수정 계획 리스트",
        agent=planner
    )
    
    task_retrieve = Task(
        description=f"작성된 기획 설계를 바탕으로, 사내 규정 RAG 데이터베이스에서 지켜야 할 예외처리, 반환값 컨벤션 등을 쿼리하여 정리해 주세요. \n\n[기능 설계서]:\n{{task_plan.output}}",
        expected_output="사내 규정 및 스타일 준수 가이드 리스트",
        agent=retriever
    )
    
    task_code = Task(
        description=f"기능 설계서와 스타일 가이드를 결합하여, 실무에 복사해 쓸 수 있는 무결한 소스코드를 작성하세요.\n\n[🚨 크리티컬 가드레일 - 절대 생략 금지]:\n어떠한 경우에도 코드의 일부나 기존 로직을 '# 기존 코드' 혹은 '# ... 생략 ...' 등의 주석으로 중략/생략하지 말고, 100% 완전한 전체 코드를 처음부터 끝까지 출력해야 합니다. 파일이 덮어씌워지므로 생략하는 순간 원래 코드가 삭제되는 대참사가 발생합니다!\n\n반드시 다음의 '멀티 파일 패치 양식'을 정확히 엄수해 각 파일의 소스코드를 독립 블록으로 뱉으세요:\n\n#### FILE: [적용할 파일 절대경로 또는 상대경로]\n```python\n# 여기에 파일의 100% 완전한 전체 소스코드를 작성하세요 (일부 생략 금지)\n```",
        expected_output="규정을 100% 만족하는 코딩 완료 포맷",
        agent=coder
    )
    
    task_validate = Task(
        description=f"작성된 코드를 시니어 테크 리드 입장에서 정밀 검수하세요. 명세한 입출력이 다 들어갔는지, 예외 처리가 규칙을 지켰는지 확인하고 코드의 위험성(결제, DB 스키마, 보안 인증, 개인정보 취급 등 민감 로직 유무)을 평가하여 최종 보정된 소스코드를 출력하세요.\n\n[🚨 크리티컬 가드레일 - 절대 생략 금지]:\n리뷰 및 검수 과정에서 주석을 통한 코드 중략/생략('# 기존 코드', '// ... 기존 로직')이 절대 있어서는 안 됩니다. 만약 생략 징후가 보이면 즉시 원래 코드를 복원하여 100% 완전한 전체 코드로 재조립해 제출하세요.\n\n반드시 아래의 '최종 멀티 파일 패치 양식'만 엄격히 출력해야 합니다. 서론/인사말 절대 제외.\n\n# 🚨 AI 자율 기능 개발 완료 리포트\n\n## 📋 개발 스펙 요약\n(스펙 요약)\n\n## 🔒 위험도 자율 평가 및 안전 조치\n- **[위험도 평가]**: (HIGH 또는 LOW - DB 스키마 변경, 결제, 권한, 보안, 개인정보 마스킹, 전역 클래스 등 주요 기능 변경 시 HIGH로 자율 명시)\n- **사유:** (HIGH/LOW 지정 사유 기술)\n\n## 🛠️ 자율 생성/수정 코드 목록\n\n#### FILE: [적용할 파일 경로]\n```python\n(100% 전체 소스코드)\n```",
        expected_output="최종 검증 완료된 자율 패치용 리포트 마크다운",
        agent=validator
    )

    swe_crew = Crew(
        agents=[planner, retriever, coder, validator],
        tasks=[task_plan, task_retrieve, task_code, task_validate],
        process=Process.sequential
    )
    
    # 503 과부하 및 None/Empty 응답 방어형 지수 백오프
    import time
    file_result_obj = None
    max_attempts = 8
    backoff_delay = 10
    
    for attempt in range(max_attempts):
        try:
            file_result_obj = swe_crew.kickoff()
            break
        except Exception as e:
            err_msg = str(e).upper()
            retry_keywords = [
                "503", "UNAVAILABLE", "429", "RATE_LIMIT", "DEMAND", "DISCONNECTED", 
                "REMOTEPROTOCOL", "CONNECTION", "SERVER", "NONE OR EMPTY", "INVALID RESPONSE", "EMPTY"
            ]
            if any(x in err_msg for x in retry_keywords):
                print(f"⚠️ [Gemini API 오류/네트워크 장애 감지] {attempt+1}회차 실패 (에러: {str(e)[:150]}). {backoff_delay}초 대기 후 자동으로 재시도합니다...")
                time.sleep(backoff_delay)
                backoff_delay = min(backoff_delay * 2, 60)
            else:
                raise e
                
    if file_result_obj is None:
        raise RuntimeError("❌ 구글 API 서버 과부하 지속으로 인해 자율 개발에 실패했습니다.")
        
    print("✅ 자율 설계 및 소스코드 자동 코딩 검증 완료.")
    report_text = str(file_result_obj)
    
    # 8. 소스코드 물리 파일 자동 생성 및 패치 적용 (--patch 활성화 시)
    if is_patch:
        patched_files = extract_and_apply_multi_patches(report_text, target_dir)
        if patched_files:
            # 💡 [나태함 자율 방어 가드레일]: 물리 패치 직전 모든 파일의 생략 주석 존재 여부를 전수 조사!
            has_lazy_omission = False
            for filepath, content in patched_files.items():
                if check_code_laziness(content):
                    print(f"\n🛑 [자율 패치 거부 - 원본 데이터 보호]: '{os.path.basename(filepath)}' 코드 내에서 생략 주석('# 기존 코드' 또는 '// ...')이 감지되었습니다! 기존 비즈니스 로직 유실 방지를 위해 이 파일의 물리적 덮어쓰기 적용을 안전하게 취소하고 중단합니다.")
                    has_lazy_omission = True
            
            if not has_lazy_omission:
                for filepath, content in patched_files.items():
                    # 필요시 상위 디렉토리 생성
                    dir_name = os.path.dirname(filepath)
                    if dir_name and not os.path.exists(dir_name):
                        os.makedirs(dir_name, exist_ok=True)
                    with open(filepath, "w", encoding="utf-8") as wf:
                        wf.write(content)
                    print(f"🛠️ [자율 개발 패치 완료]: '{filepath}' 파일이 신규 생성 또는 자율 수정되었습니다!")
            else:
                print("\nℹ️ [자율 패치 보류]: 에이전트의 나태함(생략 주석)으로 인해 소스코드 덮어쓰기를 생략하고 원본 소스는 안전하게 보존합니다. 전체 코드를 생략 없이 다시 기입하도록 에이전트에 지시하거나 수동 검토해 주세요.")
        else:
            print("⚠️ [자율 개발 패치 경고]: 출력 리포트에서 패치 대상 코드를 파싱해내지 못했습니다.")
            
    # 9. 통합 개발 리포트 저장
    output_filename = "code_review_report.md"
    with open(output_filename, "w", encoding="utf-8") as f:
        f.write(report_text)
    print(f"\n💾 [자율 개발 리포트 저장 완료]: {output_filename}")
    
    # 10. Git 자동화 및 PR / Auto-Merge 연동
    if is_patch:
        branch_name = run_git_automation(target_dir, task_prompt)
        if branch_name:
            # 💡 [PR 제목 동적 명명]: 무의미한 미사여구 대신, 실제 요구사항 제목을 PR 타이틀에 결합!
            clean_prompt = "Apply conventions and developments"
            if task_prompt:
                temp_prompt = re.sub(r'\[AI-Dev\]', '', task_prompt, flags=re.IGNORECASE).strip()
                lines = [line.strip() for line in temp_prompt.split('\n') if line.strip()]
                if lines:
                    clean_prompt = lines[0]
                if len(clean_prompt) > 50:
                    clean_prompt = clean_prompt[:50] + "..."
            pr_title = f"[AI-Dev] {clean_prompt}"
            
            pr_url = create_github_pull_request(branch_name, pr_title, report_text)
            if pr_url:
                # 💡 [글로벌 자동 병합 제어] 설정이 켜져있고, CLI 옵션으로 차단되지 않았으며, 위험도 평가 결과가 LOW인 안전 코드일 때만 Auto-Merge를 호출!
                is_auto_merge_enabled = AUTO_MERGE_DEFAULT and not no_auto_merge
                if is_auto_merge_enabled and check_auto_merge_safety(report_text):
                    enable_github_auto_merge(pr_url)
                else:
                    if not AUTO_MERGE_DEFAULT:
                        print("ℹ️ [글로벌 설정 수동 머지 전환]: 글로벌 환경 변수 설정(AUTO_MERGE_DEFAULT=False)에 의해 자동 병합을 생략하고 PR을 수동 승인 대기 상태로 유지합니다.")
                    elif no_auto_merge:
                        print("ℹ️ [CLI 옵션 수동 머지 전환]: --no-auto-merge 옵션 입력에 의해 자동 병합을 생략하고 PR을 수동 승인 대기 상태로 유지합니다.")
                    else:
                        print("ℹ️ [자율 수동 머지 전환]: 시니어 테크 리드의 위험도 평가 결과에 따라 PR을 '수동 승인 대기' 상태로 열어둡니다.")
                
    # 11. 토큰 지표 수집 및 파일 누적 기록
    m = getattr(file_result_obj, "usage_metrics", None)
    total_prompt, total_completion, total_combined = 0, 0, 0
    if m:
        total_prompt = m.get("prompt_tokens", 0) if isinstance(m, dict) else getattr(m, "prompt_tokens", 0)
        total_completion = m.get("completion_tokens", 0) if isinstance(m, dict) else getattr(m, "completion_tokens", 0)
        total_combined = m.get("total_tokens", 0) if isinstance(m, dict) else getattr(m, "total_tokens", 0)
    else:
        total_combined = 2000; total_prompt = 1500; total_completion = 500
        
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
    # 💡 [환경 변수 폴백]: CLI 인자 --task가 비어있거나 없으면 환경 변수 'AI_TASK_PROMPT'에서 지시문을 가져와 이스케이프 유실을 완벽히 방어합니다.
    task_prompt = args.task
    if not task_prompt or task_prompt.strip() == "":
        task_prompt = os.environ.get("AI_TASK_PROMPT", "")
        
    if not task_prompt or task_prompt.strip() == "":
        print("❌ 에러: 실행 요구사항(Task)이 전달되지 않았습니다. --task 인자 또는 'AI_TASK_PROMPT' 환경변수를 제공해 주세요.")
        sys.exit(1)
        
    run_swe_agent(task_prompt, args.dir, args.patch, args.max_spend, args.no_auto_merge)
