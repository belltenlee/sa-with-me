from data_masker import DataMasker
from typing import List, Dict, Any

def main() -> None:
    """
    DataMasker 클래스를 사용하여 데이터 마스킹 기능을 시연하는 메인 함수.
    샘플 데이터를 생성하고, 마스킹 전후의 데이터를 출력하여 기능을 확인합니다.
    """
    # 1. 샘플 데이터 생성
    # 다양한 케이스를 포함하여 마스킹 기능의 유연성을 테스트합니다.
    sample_data: List[Dict[str, Any]] = [
        {"id": 1, "name": "홍길동", "email": "hong.gildong@example.com", "account_number": "123-45-67890"},
        {"id": 2, "name": "김철수", "email": "kim.chulsoo@example.com", "account_number": "987-65-43210"},
        {"id": 3, "name": "이영희", "email": "lee.younghee@example.com", "account_number": "111-22-33344"},
        {"id": 4, "name": "박지성", "email": "park.jisung@example.com"}, # 계좌번호 필드가 없는 경우
        {"id": 5, "email": "no.name@example.com", "account_number": "555-66-77788"}, # 이름 필드가 없는 경우
        {"id": 6, "city": "서울", "zip": "01234"} # 마스킹 대상 필드가 전혀 없는 경우
    ]

    print("--- 원본 데이터 목록 ---")
    for record in sample_data:
        print(record)
    print("\n" + "="*50 + "\n")

    # 2. DataMasker 인스턴스 생성 및 데이터 목록 마스킹 적용
    masker = DataMasker()
    try:
        masked_data = masker.mask_records(sample_data)
        print("--- 마스킹된 데이터 목록 ---")
        for record in masked_data:
            print(record)
        print("\n" + "="*50 + "\n")
    except TypeError as e:
        print(f"데이터 목록 마스킹 중 오류 발생: {e}")
    except ValueError as e:
        print(f"데이터 목록 마스킹 중 설정 오류 발생: {e}")


    # 3. 단일 레코드 마스킹 예시
    single_record: Dict[str, Any] = {"id": 7, "name": "최수영", "account_number": "000-11-22233", "status": "active"}
    print("--- 단일 레코드 원본 ---")
    print(single_record)
    print("\n" + "-"*20 + "\n")

    try:
        masked_single_record = masker.mask_record(single_record)
        print("--- 단일 레코드 마스킹 후 ---")
        print(masked_single_record)
        print("\n" + "="*50 + "\n")
    except TypeError as e:
        print(f"단일 레코드 마스킹 중 오류 발생: {e}")
    except ValueError as e:
        print(f"단일 레코드 마스킹 중 설정 오류 발생: {e}")

    # 4. 원본 데이터 불변성 확인
    print("--- 원본 데이터 목록 (마스킹 후에도 변경되지 않음) ---")
    for record in sample_data:
        print(record)
    print("\n" + "="*50 + "\n")

    # 5. 예외 처리 시연 (잘못된 입력 타입)
    print("--- 예외 처리 시연: 잘못된 입력 타입 ---")
    try:
        masker.mask_record("이것은 딕셔너리가 아닙니다.")
    except TypeError as e:
        print(f"예상된 오류 발생: {e}")
    print("\n" + "="*50 + "\n")

    print("--- 예외 처리 시연: 잘못된 길이 설정 ---")
    try:
        # 임시로 길이 설정을 변경하여 ValueError 발생 시연
        class TempMasker(DataMasker):
            @staticmethod
            def _generate_random_name(min_length: int = 5, max_length: int = 2) -> str: # min > max
                return super()._generate_random_name(min_length, max_length)
        
        temp_masker = TempMasker()
        temp_masker.mask_record({"name": "테스트"})
    except ValueError as e:
        print(f"예상된 오류 발생: {e}")
    print("\n" + "="*50 + "\n")


if __name__ == "__main__":
    main()