# 사내 표준 백엔드 엔터프라이즈 소프트웨어 개발 컨벤션 (FastAPI & Python)

본 문서는 사내 엔터프라이즈 서비스 개발 시 코드의 무결성, 확장성, 보안성 및 시스템 안전성을 최고 수준으로 담보하기 위해 반드시 준수해야 하는 **마스터 클래스 가이드라인**입니다. 자율 코딩 및 검수 에이전트는 본 문서를 바이블로 삼아 모든 자율 기획 및 신규 코딩 결과물을 엄격히 평가하고 교정합니다.

---

## 1. 🏗️ clean Architecture 레이어드 아키텍처 표준

코드의 유지보수성과 이식성을 극대화하기 위해, 모든 신규 기능은 역할을 철저히 분리한 **3-Tier 레이어드 아키텍처**를 엄격히 준수합니다. 레이어가 섞이거나 비즈니스 로직이 컨트롤러에 노출되는 즉시 에이전트 심사에서 반려됩니다.

```
[Presentation Layer] (Controllers / Routers)
         │  (Request DTO 수신 & Validation)
         ▼
[Domain / Business Layer] (Services / Use Cases)
         │  (핵심 도메인 비즈니스 규칙 및 예외처리 트랜잭션 조율)
         ▼
[Infrastructure Layer] (Repositories / Database / External APIs)
```

1. **컨트롤러 레이어 (Presentation Layer):**
   * **역할:** 라우팅 경로 정의, HTTP 상태코드 매핑, 요청(Request) DTO 유효성 검사, 응답(Response) DTO 렌더링.
   * **금지 사항:** 데이터베이스 직접 쿼리(SQL/ORM) 금지, 비즈니스 연산 로직 포함 금지.
2. **서비스 레이어 (Business Logic Layer):**
   * **역할:** 비즈니스 시나리오 조율, 비즈니스 예외 던지기, 트랜잭션 단위 관리.
   * **금지 사항:** HTTP 요청/응답 객체(`Request`, `Response`, `st.status` 등 HTTP 관련 라이브러리) 임포트 및 참조 금지.
3. **레포지토리 레이어 (Infrastructure Layer):**
   * **역할:** ORM 또는 raw SQL을 통한 물리 DB 조작, 외부 서드파티 API 통신, 캐시(Redis) 읽기/쓰기.

---

## 2. 🚨 트랜잭션 무결성 및 데드락(Deadlock) 방지 표준

동시성 요청이 몰리는 엔터프라이즈 환경에서 데이터 왜곡과 락 병목을 영구 차단합니다.

1. **원자성 보장 (Atomicity):**
   * 둘 이상의 테이블을 수정하거나, 연쇄적인 데이터 변경이 일어나는 모든 서비스 함수는 반드시 단일 DB 트랜잭션(`with db.begin():` 또는 비상 시 `commit` / `rollback` 구조) 내에서 수행되어야 합니다.
   * 쓰기(CUD) 연산 도중 에러 발생 시 변경 사항이 즉각 롤백되어 온전성을 유지해야 합니다.
2. **비관적 락(Pessimistic Lock) & 데드락 회피 규칙:**
   * 재고 차감, 포인트 결제 등 동시 수정 위험이 큰 공유 자원은 `SELECT ... FOR UPDATE` 구문을 활용해 원자적 락을 획득해야 합니다.
   * 복수 테이블을 락온할 때는 반드시 **항상 동일한 순서로 테이블을 조회**하도록 강제하여 순환 대기 데드락(Deadlock)을 원천 예방하십시오.

### 💻 모범 코드 예시 (비동기 트랜잭션 및 비관적 락)
```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from core.exceptions import OutOfStockException

async def process_order(db: AsyncSession, product_id: int, quantity: int):
    # 1. 단일 트랜잭션 블록 개시
    async with db.begin():
        # 2. 비관적 락 획득 (FOR UPDATE) - 재고 선점
        query = select(Product).filter(Product.id == product_id).with_for_update()
        result = await db.execute(query)
        product = result.scalar_one_or_none()
        
        if not product or product.stock < quantity:
            # 원자적으로 트랜잭션 롤백되며 예외 전파
            raise OutOfStockException(detail="재고가 부족합니다.")
            
        product.stock -= quantity
        db.add(product)
```

---

## 3. 🛡️ 보안 취약점 방어 및 민감 데이터 마스킹 표준 (Security & Masking)

OWASP Top 10을 기본 탑재하고, 사용자 개인정보 누출을 물리적으로 차단합니다.

1. **SQL Injection 방어:**
   * 문자열 포맷팅(`f"SELECT * FROM users WHERE name = '{name}'"`)을 통한 무분별한 쿼리 조립을 전면 금지합니다.
   * 무조건 ORM 바인딩 매개변수(Prepared Statements)를 사용해 질의를 전달해야 합니다.
2. **민감 정보 정밀 마스킹 (Masking):**
   * 사용자 비밀번호는 SHA-256 또는 BCrypt 해시 알고리즘(`passlib` 등)으로 단방향 솔트 암호화하여 DB에 보관해야 하며, **절대 평문으로 보관할 수 없습니다.**
   * 로그 파일, API 응답 값 등에 주민등록번호, 카드 번호, 전화번호, 이메일 주소가 온전히 디스플레이되지 않도록 정규식을 활용해 마스킹 처리해야 합니다.

### 💻 모범 코드 예시 (데이터 마스킹 유틸리티)
```python
import re

def mask_email(email: str) -> str:
    """이메일 주소의 앞 3글자만 노출하고 골뱅이 앞까지 마스킹 처리합니다."""
    if not email or "@" not in email:
        return "***"
    user_part, domain_part = email.split("@", 1)
    if len(user_part) <= 3:
        return user_part[0] + "*" * (len(user_part) - 1) + "@" + domain_part
    return user_part[:3] + "*" * (len(user_part) - 3) + "@" + domain_part
```

---

## 4. 🧪 무결성 테스트(Unit & Integration Test) 설계 표준

유능한 에이전트는 코드만 짜지 않고, 자율 개발한 신규 비즈니스 기능이 오동작하지 않음을 입증할 **PyTest 기반의 테스트 케이스**를 함께 동반 탑재하여 제출합니다.

1. **단위 테스트 (Unit Test) 범위:**
   * 비즈니스 핵심 연산 함수(예: 수수료율 계산, 나이 판별 로직 등)는 가짜 외부 모킹(`unittest.mock`)을 사용하여 고속 독립 테스트되도록 구성합니다.
2. **FastAPI 테스트 클라이언트 연동:**
   * `httpx.AsyncClient` 또는 `fastapi.testclient.TestClient`를 사용해 신규 엔드포인트의 200 OK 성공 케이스 및 422/400 예외 차단 케이스를 검증하는 코드를 작성합니다.

### 💻 모범 코드 예시 (PyTest Mock API Test)
```python
import pytest
from httpx import AsyncClient
from main import app

@pytest.mark.asyncio
async def test_sms_verification_flow():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # 1. SMS 인증 코드 발송 API 요청 검증
        response = await ac.post("/api/v1/sms/send", json={"phone": "01012345678"})
        assert response.status_code == 200
        assert response.json()["message"] == "인증코드가 발송되었습니다."
```