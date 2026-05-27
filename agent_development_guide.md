# 🤖 자율 개발 Agent 표준 가이드라인: 엔터프라이즈 아키텍처 및 컨벤션
# (Enterprise Architecture & Convention Guide for Autonomous Agents)

본 문서는 자율 코딩, 리팩토링 및 코드 검수 에이전트가 코드를 생성하고 평가할 때 바이블로 삼아야 하는 **최고 수준의 엔터프라이즈 표준 가이드라인**입니다. 본 가이드는 ChromaDB 등 벡터 데이터베이스에 임베딩되어 에이전트의 RAG 컨텍스트로 활용되며, 에이전트는 모든 자율 기획 및 신규 코딩 결과를 본 기준에 맞추어 엄격히 검증해야 합니다.

---

## PART 1. 🐍 파이썬 엔터프라이즈 소프트웨어 개발 표준 (FastAPI & Python)

### 1. 🏗️ Clean Architecture 레이어드 아키텍처 표준
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

#### 1.1 컨트롤러 레이어 (Presentation Layer)
* **역할:** 라우팅 경로 정의, HTTP 상태코드 매핑, 요청(Request) DTO 유효성 검사, 응답(Response) DTO 렌더링.
* **금지 사항:** 데이터베이스 직접 쿼리(SQL/ORM) 금지, 비즈니스 연산 로직 포함 금지.

#### 1.2 서비스 레이어 (Business Logic Layer)
* **역할:** 비즈니스 시나리오 조율, 비즈니스 예외 던지기, 트랜잭션 단위 관리.
* **금지 사항:** HTTP 요청/응답 객체(`Request`, `Response`, `st.status` 등 HTTP 관련 라이브러리) 임포트 및 참조 금지. pure 파이썬 객체 및 DTO만 다루어야 함.

#### 1.3 레포지토리 레이어 (Infrastructure Layer)
* **역할:** ORM 또는 raw SQL을 통한 물리 DB 조작, 외부 서드파티 API 통신, 캐시(Redis) 읽기/쓰기.

---

### 2. 🚨 트랜잭션 무결성 및 데드락(Deadlock) 방지 표준
동시성 요청이 몰리는 엔터프라이즈 환경에서 데이터 왜곡과 락 병목을 영구 차단합니다.

#### 2.1 원자성 보장 (Atomicity)
* 둘 이상의 테이블을 수정하거나, 연쇄적인 데이터 변경이 일어나는 모든 서비스 함수는 반드시 단일 DB 트랜잭션(`with db.begin():` 또는 비상 시 `commit` / `rollback` 구조) 내에서 수행되어야 합니다.
* 쓰기(CUD) 연산 도중 에러 발생 시 변경 사항이 즉각 롤백되어 온전성을 유지해야 합니다.

#### 2.2 비관적 락(Pessimistic Lock) & 데드락 회피 규칙
* 재고 차감, 포인트 결제 등 동시 수정 위험이 큰 공유 자원은 `SELECT ... FOR UPDATE` 구문을 활용해 원자적 락을 획득해야 합니다.
* 복수 테이블을 락온할 때는 반드시 **항상 동일한 순서로 테이블을 조회**하도록 강제하여 순환 대기 데드락(Deadlock)을 원천 예방하십시오.

#### 💻 모범 코드 예시 (비동기 트랜잭션 및 비관적 락)
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

### 3. 🛡️ 보안 취약점 방어 및 민감 데이터 마스킹 표준 (Security & Masking)

OWASP Top 10을 기본 탑재하고, 사용자 개인정보 누출을 물리적으로 차단합니다.

#### 3.1 SQL Injection 방어
* 문자열 포맷팅(`f"SELECT * FROM users WHERE name = '{name}'"`)을 통한 무분별한 쿼리 조립을 전면 금지합니다.
* 무조건 ORM 바인딩 매개변수(Prepared Statements)를 사용해 질의를 전달해야 합니다.

#### 3.2 민감 정보 정밀 마스킹 (Masking)
* 사용자 비밀번호는 SHA-256 또는 BCrypt 해시 알고리즘(`passlib` 등)으로 단방향 솔트 암호화하여 DB에 보관해야 하며, **절대 평문으로 보관할 수 없습니다.**
* 로그 파일, API 응답 값 등에 고유 식별 정보, 카드 번호, 전화번호, 이메일 주소가 온전히 디스플레이되지 않도록 정규식을 활용해 마스킹 처리해야 합니다.
* *주의: 주민등록번호(RRN), 마이넘버(MyNumber), 아드하르(Aadhaar) 등 법적 초민감 고유 식별 정보의 실제 숫자는 보안 규정상 시스템 외부 응답이나 코드 컨텍스트에 원본 그대로 노출·출력될 수 없으며, 발견 즉시 예외 없이 마스킹(`[Redacted]` 등) 처리해야 합니다.*

#### 💻 모범 코드 예시 (데이터 마스킹 유틸리티)
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

### 4. 🧪 무결성 테스트(Unit & Integration Test) 설계 표준

유능한 에이전트는 코드만 짜지 않고, 자율 개발한 신규 비즈니스 기능이 오동작하지 않음을 입증할 **PyTest 기반의 테스트 케이스**를 함께 동반 탑재하여 제출합니다.

#### 4.1 단위 테스트 (Unit Test) 범위
* 핵심 비즈니스 연산 함수(예: 수수료율 계산, 나이 판별 로직 등)는 가짜 외부 모킹(`unittest.mock`)을 사용하여 고속 독립 테스트되도록 구성합니다.

#### 4.2 FastAPI 테스트 클라이언트 연동
* `httpx.AsyncClient` 또는 `fastapi.testclient.TestClient`를 사용해 신규 엔드포인트의 200 OK 성공 케이스 및 422/400 예외 차단 케이스를 검증하는 코드를 작성합니다.

#### 💻 모범 코드 예시 (PyTest Mock API Test)
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

---

## PART 2. ⚡ 프론트엔드 엔터프라이즈 아키텍처 표준 (TypeScript & Next.js)

### 1. 🗂️ Next.js (App Router) 구조화 및 컴포넌트 역할 분리

Next.js 14+ 시스템에서는 성능과 보안을 최적화하기 위해 서버 컴포넌트(Server Components)와 클라이언트 컴포넌트(Client Components)를 엄격히 분리하여 설계해야 합니다.

```
src/
├── app/                  # App Router (Routing, Layout, Pages)
├── components/           # 공통 UI 컴포넌트
│   ├── shared/           # 재사용 가능한 순수 UI (디자인 시스템)
│   └── features/         # 비즈니스 도메인별 특화 컴포넌트
├── hooks/                # 커스텀 React Hooks (클라이언트 로직)
├── services/             # API 통신 및 데이터 페칭 레이어
└── types/                # TypeScript 전역 타입 정의 인터페이스
```

#### 1.1 서버 컴포넌트 (RSC - Server Components) 우선 원칙
* `src/app` 내부의 모든 페이지 및 레이아웃은 기본적으로 **서버 컴포넌트**로 구성합니다.
* **역할:** 직접적인 데이터베이스 쿼리, 보안이 필요한 외부 API 호출, 초기 데이터 페칭 및 HTML 렌더링.
* **금지 사항:** `useState`, `useEffect`, `useRouter` 등의 Hook 사용 금지, 브라우저 이벤트 리스너(`onClick` 등) 사용 금지.

#### 1.2 클라이언트 컴포넌트 (Client Components) 분리 규칙
* 상태 관리나 브라우저 인터랙션이 필요한 컴포넌트는 반드시 최상단에 `"use client"` 지시어를 명시합니다.
* **설계 원칙:** 리프 컴포넌트(Leaf Component) 단으로 최대한 내려서 설계하여, 서버 컴포넌트의 캐싱 이점을 전체 페이지가 누릴 수 있도록 유도합니다.

---

### 2. 🔒 TypeScript 정적 타입 선언 및 데이터 안정성 표준

에이전트는 코드 안정성을 보장하기 위해 `any` 타입 사용을 원천 금지하며, 엄격한 정적 타이핑과 런타임 검증을 동시 수행해야 합니다.

#### 2.1 Any 타입 금지 및 Unknown 활용
* 모든 변수, 함수의 파라미터, 반환 값에는 명확한 인터페이스(`interface`) 또는 타입(`type`)을 정의해야 합니다.
* 동적 API 응답 등 타입을 즉시 알 수 없는 경우 `any` 대신 `unknown`을 할당하고, 타입 가드(Type Guard)를 통해 타입을 좁혀서 사용합니다.

#### 2.2 Zod를 활용한 런타임 스키마 검증
* 서버 클라이언트 간 통신, 폼 데이터 입력 등 외부에서 유입되는 모든 데이터는 `Zod` 라이브러리를 활용해 런타임 유효성 검사를 강제합니다.

#### 💻 모범 코드 예시 (TypeScript & Zod 데이터 검증 및 페칭)
```typescript
import { z } from "zod";

// 1. 응답 데이터 스키마 정의
export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(2),
  role: z.enum(["ADMIN", "USER"]),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

// 2. 데이터 페칭 함수 (서버 컴포넌트 또는 서비스 레이어용)
export async function getUserProfile(userId: string): Promise<UserProfile> {
  const response = await fetch(`https://api.enterprise.com/v1/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${process.env.INTERNAL_API_KEY}`,
    },
    next: { revalidate: 3600 }, // 1시간 캐싱 규칙 적용
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user profile: ${response.statusText}`);
  }

  const rawData: unknown = await response.json();
  
  // 3. 런타임 유효성 검증 및 타입 추론 안정성 보장
  const validatedData = UserProfileSchema.safeParse(rawData);
  if (!validatedData.success) {
    console.error("Schema Validation Error:", validatedData.error);
    throw new Error("Invalid server response structure.");
  }

  return validatedData.data;
}
```

---

### 3. 🛡️ 프론트엔드 보안 및 성능 최적화 표준

#### 3.1 XSS 및 데이터 노출 방어
* `dangerouslySetInnerHTML`은 원칙적으로 금지하며, 사용 시 반드시 `dompurify` 같은 새니타이징 라이브러리를 거쳐야 합니다.
* 환경 변수 관리 시, 브라우저에 노출되어도 안전한 변수만 `NEXT_PUBLIC_` 접두사를 붙이고 DB 커넥션 툴이나 비밀 키는 접두사 없이 서버 컴포넌트 영역에서만 관리합니다.

#### 3.2 Next.js 성능 최적화 규칙
* **이미지 최적화:** 모든 이미지는 표준 HTML `<img>` 태그 대신 `next/image` 컴포넌트를 사용하고 `width`, `height`, `alt` 속성을 명시하여 Layout Shift를 방지합니다.
* **폰트 최적화:** 외부 웹폰트 로드를 차단하고 `next/font/google`을 활용해 빌드 타임에 로컬 자산으로 다운로드 및 내장 처리합니다.

---

## 🤖 [Agent 가이드] ChromaDB 임베딩 매뉴얼 및 유능한 에이전트 행동 지침

### 1. ChromaDB 임베딩 전략 (Chunking & Tagging)

에이전트가 이 문서를 검색(Retrieval)하여 지식을 참조할 때 오탐율을 줄이기 위해, 시스템은 본 문서를 다음과 같은 메타데이터 구조로 나누어 청킹(Chunking) 후 임베딩해야 합니다.

* **메타데이터 필수 태그:** `language: "python" | "typescript"`, `layer: "architecture" | "transaction" | "security" | "test"`, `framework: "fastapi" | "nextjs"`
* **검색 최적화 조언:** 에이전트가 "Next.js에서 API 데이터 타입을 검증하고 싶어"라고 질문하면 `framework: "nextjs"`, `layer: "security"` 태그가 매핑된 텍스트 청크가 우선 전달되도록 필터링 규칙을 세팅하십시오.

### 2. 슈퍼 초일류(유능한) 코딩 에이전트의 4대 핵심 행동 로직

본 문서를 주입받은 에이전트는 코드를 작성하거나 기획할 때 반드시 다음 단계를 자율 수행해야 초일류 에이전트로 동작할 수 있습니다.

1. **[1단계: 요구사항 스캔 및 아키텍처 레이어 매핑]**
* 사용자의 요구사항이 들어오면 3-Tier 중 어느 레이어에 속하는지 판별하고, Next.js 파일 시스템의 올바른 위치(`src/app` vs `src/components/features`)를 자율 결정합니다.

2. **[2단계: 동시성 및 보안 위험 식별]**
* "수정", "삭제", "결제", "재고" 단어가 포함되어 있다면 무조건 트랜잭션 블록(`db.begin()`)을 자동으로 설계하고, 비관적 락 조회 방식을 도입합니다.

3. **[3단계: 철저한 데이터 무결성 타이핑/Validation]**
* Python 진영의 Pydantic / FastAPI DTO 구조와 TS 진영의 Zod 스키마 검증 코드를 양쪽 엔드포인트에 쌍으로 배치하여 엔드투엔드 타입 무결성을 완성합니다.

4. **[4단계: 자율 검수 및 실패 테스트케이스 동반 생성]**
* 코드를 다 짰다면 스스로 `PyTest` 코드나 클라이언트 테스트 코드를 생성하여, 정상 작동뿐만 아니라 예외 상황(예: 재고 부족, 잘못된 형식 입력)에서 에러를 정상적으로 던지는지 증명합니다.

---

### 💡 ChromaDB 임베딩 팁 (유능한 에이전트 구축을 위한 추천)
ChromaDB에 이 문서를 저장할 때, **마크다운의 헤더(`##`, `###`) 단위로 청크(Chunk)를 쪼개어** 저장하는 것이 가장 효과적입니다. 각 청크마다 소스 정보(예: `{"source": "enterprise_guide", "part": "python_transaction"}`)를 메타데이터로 부여하면, 에이전트가 파이썬 코드를 짤 때 Next.js 컨텍스트와 뒤섞이지 않고 필요한 표준 규격만 정확하게 집어내어 완벽한 코드를 생산하게 됩니다.
