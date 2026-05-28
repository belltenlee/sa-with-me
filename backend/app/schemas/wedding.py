from pydantic import BaseModel, Field
from typing import Optional

# BankAccountInfo 스키마는 더 이상 사용되지 않으므로 완전히 제거합니다.

class GuestInfo(BaseModel):
    name: str
    contact: str

class WeddingInvitationResponse(BaseModel):
    wedding_id: str = Field(..., description="청첩장 고유 ID")
    groom_name: str = Field(..., description="신랑 이름")
    bride_name: str = Field(..., description="신부 이름")
    wedding_date: str = Field(..., description="결혼식 일시 (ISO 8601 형식)")
    location: str = Field(..., description="결혼식 장소")
    # 기존 groom_bank_account 및 bride_bank_account 필드를 완전히 제거합니다.
    # 기타 청첩장 관련 필드는 필요시 여기에 추가합니다.