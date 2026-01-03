"""
Page Object Model - デモページ
Python版のPage Object実装例
"""
from playwright.sync_api import Page, Locator


class DemoPage:
    """デモページのPage Objectクラス"""

    def __init__(self, page: Page):
        self.page = page

        # セレクタを定義
        self.counter: Locator = page.locator("text=/^\\d+$/").first
        self.increment_button: Locator = page.get_by_role("button", name="+1")
        self.reset_button: Locator = page.get_by_role("button", name="リセット")
        self.red_button: Locator = page.get_by_role("button", name="赤", exact=True)
        self.green_button: Locator = page.get_by_role("button", name="緑", exact=True)
        self.blue_button: Locator = page.get_by_role("button", name="青", exact=True)

    def goto(self) -> None:
        """デモページに移動"""
        self.page.goto("/demo")

    def increment_counter(self, times: int = 1) -> None:
        """カウンターを指定回数増やす"""
        for _ in range(times):
            self.increment_button.click()

    def reset_counter(self) -> None:
        """カウンターをリセット"""
        self.reset_button.click()

    def select_color(self, color: str) -> None:
        """
        色を選択

        Args:
            color: "赤", "緑", または "青"
        """
        color_map = {
            "赤": self.red_button,
            "緑": self.green_button,
            "青": self.blue_button,
        }
        if color not in color_map:
            raise ValueError(f"Invalid color: {color}. Must be one of: 赤, 緑, 青")

        color_map[color].click()

    def get_counter_value(self) -> str:
        """現在のカウンター値を取得"""
        return self.counter.text_content() or "0"

    @property
    def url(self) -> str:
        """現在のページURL"""
        return self.page.url
