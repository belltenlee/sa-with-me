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