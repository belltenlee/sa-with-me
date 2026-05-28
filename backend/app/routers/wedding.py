from fastapi import APIRouter, HTTPException
from typing import Dict
from app.schemas.wedding import WeddingInvitationResponse # BankAccountInfo는 더 이상 필요 없으므로 import하지 않습니다.

router = APIRouter(prefix="/api", tags=["wedding"])

# Dummy data for demonstration
# 계좌 정보 필드를 완전히 제거한 더미 데이터로 수정합니다.
DUMMY_WEDDING_DATA = {
    "wedding_123": {
        "wedding_id": "wedding_123",
        "groom_name": "김철수",
        "bride_name": "이영희",
        "wedding_date": "2024-12-25T14:00:00Z",
        "location": "그랜드 볼룸",
        # 계좌 정보 필드는 완전히 제거되었습니다.
    }
}

@router.get("/wedding/{wedding_id}", response_model=WeddingInvitationResponse, summary="청첩장 정보 조회")
async def get_wedding_invitation(wedding_id: str):
    """
    특정 ID의 청첩장 정보를 조회합니다.
    """
    if wedding_id not in DUMMY_WEDDING_DATA:
        raise HTTPException(status_code=404, detail="Wedding invitation not found")
    
    # 계좌 정보가 제거된 데이터를 반환합니다.
    return DUMMY_WEDDING_DATA[wedding_id]