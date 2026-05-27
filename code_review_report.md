# 🚨 AI 자율 기능 개발 완료 리포트

## 📋 개발 스펙 요약
사용자 페이지에 노출될 수 있는 민감 정보(이름, 계좌번호)를 무작위 데이터로 대체하여 정보 유출 및 악용 위험을 방지하는 데이터 마스킹 기능을 구현했습니다. `DataMasker` 클래스는 단일 레코드(`dict`) 또는 레코드 목록(`list[dict]`)을 입력받아 'name' 및 'account_number' 필드를 무작위로 생성된 가짜 이름과 계좌번호로 대체합니다. 원본 데이터의 불변성을 유지하며, 2~4글자의 한글 이름과 10~14자리의 숫자 계좌번호를 생성합니다.

## 🔒 위험도 자율 평가 및 안전 조치
- **[위험도 평가]**: HIGH
- **사유**: 본 기능은 사용자 개인정보(이름, 계좌번호)를 직접적으로 다루며, 이를 마스킹하여 보안을 강화하는 핵심 로직입니다. 코드에 잠재된 결함은 민감 정보의 노출 또는 잘못된 마스킹으로 이어질 수 있어, 개인정보보호 및 보안 측면에서 매우 높은 위험도를 가집니다. 따라서 철저한 검증과 지속적인 모니터링이 필수적입니다.

## 🛠️ 자율 생성/수정 코드 목록

#### FILE: data_masker.py
```python
import random
import string
from typing import List, Dict, Any

class DataMasker:
    """
    민감한 데이터를 무작위 값으로 마스킹하는 기능을 제공하는 클래스.
    'name'과 'account_number' 필드를 마스킹 대상으로 합니다.
    """

    @staticmethod
    def _generate_random_korean_char() -> str:
        """
        무작위 한글 한 글자를 생성합니다.
        유니코드 AC00-D7A3 (가-힣) 범위 내에서 문자를 선택합니다.
        """
        return chr(random.randint(0xAC00, 0xD7A3))

    @staticmethod
    def _generate_random_name(min_length: int = 2, max_length: int = 4) -> str:
        """
        무작위 가짜 한글 이름을 생성합니다.
        기본적으로 2~4글자의 한글 이름을 생성합니다.

        Args:
            min_length (int): 생성될 이름의 최소 길이.
            max_length (int): 생성될 이름의 최대 길이.

        Returns:
            str: 무작위로 생성된 한글 이름.
        """
        if not (isinstance(min_length, int) and isinstance(max_length, int) and 0 < min_length <= max_length):
            raise ValueError("min_length와 max_length는 양의 정수여야 하며, min_length는 max_length보다 작거나 같아야 합니다.")
        
        length = random.randint(min_length, max_length)
        return ''.join(DataMasker._generate_random_korean_char() for _ in range(length))

    @staticmethod
    def _generate_random_account_number(min_length: int = 10, max_length: int = 14) -> str:
        """
        무작위 가짜 계좌번호를 생성합니다.
        기본적으로 10~14자리의 숫자로 구성됩니다.

        Args:
            min_length (int): 생성될 계좌번호의 최소 길이.
            max_length (int): 생성될 계좌번호의 최대 길이.

        Returns:
            str: 무작위로 생성된 숫자 문자열 계좌번호.
        """
        if not (isinstance(min_length, int) and isinstance(max_length, int) and 0 < min_length <= max_length):
            raise ValueError("min_length와 max_length는 양의 정수여야 하며, min_length는 max_length보다 작거나 같아야 합니다.")

        length = random.randint(min_length, max_length)
        return ''.join(random.choice(string.digits) for _ in range(length))

    def mask_record(self, record: Dict[str, Any]) -> Dict[str, Any]:
        """
        단일 레코드(dict) 내의 'name'과 'account_number' 필드를 마스킹합니다.
        원본 레코드를 변경하지 않고 새로운 마스킹된 레코드를 반환합니다.

        Args:
            record (Dict[str, Any]): 마스킹할 원본 레코드.

        Returns:
            Dict[str, Any]: 'name'과 'account_number' 필드가 마스킹된 새로운 레코드.
                            원본 레코드의 다른 필드는 유지됩니다.

        Raises:
            TypeError: 입력 `record`가 딕셔너리 타입이 아닐 경우 발생합니다.
        """
        if not isinstance(record, dict):
            raise TypeError("입력 'record'는 딕셔너리 타입이어야 합니다.")

        # 원본 데이터 보호를 위해 레코드를 복사합니다.
        masked_record = record.copy()

        if 'name' in masked_record:
            masked_record['name'] = self._generate_random_name()
        if 'account_number' in masked_record:
            masked_record['account_number'] = self._generate_random_account_number()

        return masked_record

    def mask_records(self, records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        레코드 목록(list[dict]) 내의 모든 레코드를 마스킹합니다.
        원본 레코드 목록을 변경하지 않고 새로운 마스킹된 레코드 목록을 반환합니다.

        Args:
            records (List[Dict[str, Any]]): 마스킹할 원본 레코드 목록.

        Returns:
            List[Dict[str, Any]]: 'name'과 'account_number' 필드가 마스킹된 새로운 레코드 목록.

        Raises:
            TypeError: 입력 `records`가 리스트 타입이 아닐 경우 발생합니다.
            TypeError: `records` 리스트 내의 요소가 딕셔너리 타입이 아닐 경우 발생합니다.
        """
        if not isinstance(records, list):
            raise TypeError("입력 'records'는 리스트 타입이어야 합니다.")
        
        # 각 레코드에 대해 mask_record 메서드를 적용하여 새로운 목록을 생성합니다.
        # mask_record 내부에서 개별 레코드의 타입 검사를 수행하므로 여기서는 리스트 요소에 대한 명시적 검사는 생략합니다.
        # (mask_record가 TypeError를 발생시킬 수 있음)
        return [self.mask_record(record) for record in records]

```
#### FILE: main.py
```python
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

```