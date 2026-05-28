import React, { useEffect, useState } from 'react';
import './WeddingInvitation.css';

// TypeScript를 사용한다면 아래와 같이 인터페이스를 정의하여 타입 안정성을 높일 수 있습니다.
// interface WeddingInvitationData {
//     wedding_id: string;
//     groom_name: string;
//     bride_name: string;
//     wedding_date: string;
//     location: string;
// }

function WeddingInvitation({ weddingId }) {
    // API 응답 타입이 명확하므로, `any` 대신 `null`로 초기화하고 데이터 로드 후 타입이 추론되도록 합니다.
    // TypeScript 환경에서는 `useState<WeddingInvitationData | null>(null)`과 같이 명시할 수 있습니다.
    const [invitation, setInvitation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInvitation = async () => {
            try {
                const response = await fetch(`/api/wedding/${weddingId}`);
                if (!response.ok) {
                    // HTTP 에러 발생 시, 백엔드에서 제공하는 구체적인 에러 메시지를 포함하여 예외를 던집니다.
                    // FastAPI는 기본적으로 `{"detail": "..."}` 형태의 에러를 반환합니다.
                    let errorDetail = 'Unknown error';
                    try {
                        const errorData = await response.json();
                        if (errorData && typeof errorData === 'object' && 'detail' in errorData) {
                            errorDetail = errorData.detail;
                        }
                    } catch (jsonError) {
                        // JSON 파싱 실패 시, 기본 에러 메시지 사용
                        console.error("Failed to parse error response JSON:", jsonError);
                    }
                    throw new Error(`HTTP error! status: ${response.status}, detail: ${errorDetail}`);
                }
                const data = await response.json();
                setInvitation(data);
            } catch (e) {
                // 에러 객체의 타입을 `unknown`으로 처리하고, `instanceof Error`로 타입을 좁혀 메시지에 접근합니다.
                if (e instanceof Error) {
                    setError(e);
                } else {
                    // 예상치 못한 타입의 에러가 발생했을 경우를 대비하여 새로운 Error 객체를 생성합니다.
                    setError(new Error("An unexpected error occurred during data fetching."));
                }
            } finally {
                setLoading(false);
            }
        };

        fetchInvitation();
    }, [weddingId]);

    if (loading) return <div className="loading-message">청첩장 정보를 불러오는 중...</div>;
    if (error) return <div className="error-message">오류 발생: {error.message}</div>;
    if (!invitation) return <div className="no-data-message">청첩장 정보를 찾을 수 없습니다.</div>;

    return (
        <div className="wedding-invitation">
            <h1>{invitation.groom_name} & {invitation.bride_name}의 결혼식에 초대합니다</h1>
            <p className="wedding-date">일시: {new Date(invitation.wedding_date).toLocaleString()}</p>
            <p className="wedding-location">장소: {invitation.location}</p>

            {/*
                기존 계좌 정보 표시 섹션 (마음 전하실 곳)은 백엔드에서 해당 데이터를 더 이상 제공하지 않으므로,
                프론트엔드에서도 렌더링할 필요가 없어 완전히 제거되었습니다.
            */}

            {/* 기타 청첩장 상세 정보 (필요시 추가) */}
        </div>
    );
}

export default WeddingInvitation;