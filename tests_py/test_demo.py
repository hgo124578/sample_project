"""
デモページのテスト
JavaScript版 tests/demo.spec.js のPython移植版
"""
import re
import pytest
from playwright.sync_api import Page, expect


@pytest.mark.e2e
class TestDemoCounter:
    """カウンター機能のテスト"""

    def test_counter_increments(self, demo_page: Page):
        """カウンター機能が動作する"""
        # Arrange
        counter = demo_page.locator("text=/^\\d+$/").first

        # 初期値確認
        expect(counter).to_have_text("0")

        # Act
        demo_page.get_by_role("button", name="+1").click()

        # Assert
        expect(counter).to_have_text("1")

    def test_counter_multiple_clicks(self, demo_page: Page):
        """複数回クリックで正しく累積される"""
        # Arrange
        counter = demo_page.locator("text=/^\\d+$/").first
        increment_button = demo_page.get_by_role("button", name="+1")

        # Act
        increment_button.click()
        increment_button.click()
        increment_button.click()

        # Assert
        expect(counter).to_have_text("3")

    def test_counter_reset(self, demo_page: Page):
        """リセットボタンでカウンターが0に戻る"""
        # Arrange
        counter = demo_page.locator("text=/^\\d+$/").first
        increment_button = demo_page.get_by_role("button", name="+1")
        reset_button = demo_page.get_by_role("button", name="リセット")

        # カウンターを5にする
        for _ in range(5):
            increment_button.click()
        expect(counter).to_have_text("5")

        # Act
        reset_button.click()

        # Assert
        expect(counter).to_have_text("0")


@pytest.mark.e2e
class TestDemoShallowRouting:
    """シャローローティングのテスト"""

    def test_color_selection_changes_url(self, demo_page: Page):
        """カラー選択でURLパラメータが変更される"""
        # Act
        demo_page.get_by_role("button", name="赤", exact=True).click()

        # Assert
        expect(demo_page).to_have_url(re.compile(r".*color=red"))

        # Act
        demo_page.get_by_role("button", name="緑", exact=True).click()

        # Assert
        expect(demo_page).to_have_url(re.compile(r".*color=green"))

    def test_tab_switching_changes_url(self, demo_page: Page):
        """タブ切り替えでURLパラメータが変更される"""
        # Act
        demo_page.get_by_role("button", name="設定").click()

        # Assert
        expect(demo_page).to_have_url(re.compile(r".*tab=settings"))
        expect(demo_page.get_by_text("URLに ?tab=settings が追加されました")).to_be_visible()

        # Act
        demo_page.get_by_role("button", name="履歴").click()

        # Assert
        expect(demo_page).to_have_url(re.compile(r".*tab=history"))

    def test_counter_persists_after_url_changes(self, demo_page: Page):
        """URLパラメータ変更後もカウンターの値が保持される（シャローローティング）"""
        # Arrange
        counter = demo_page.locator("text=/^\\d+$/").first
        increment_button = demo_page.get_by_role("button", name="+1")

        # カウンターを3にする
        for _ in range(3):
            increment_button.click()
        expect(counter).to_have_text("3")

        # Act & Assert: 色変更後もカウンター保持
        demo_page.get_by_role("button", name="赤", exact=True).click()
        expect(counter).to_have_text("3")
        expect(demo_page).to_have_url(re.compile(r".*color=red"))

        # Act & Assert: タブ変更後もカウンター保持
        demo_page.get_by_role("button", name="設定").click()
        expect(counter).to_have_text("3")
        expect(demo_page).to_have_url(re.compile(r".*tab=settings"))


@pytest.mark.e2e
@pytest.mark.parametrize("color,expected_param", [
    ("赤", "red"),
    ("緑", "green"),
    ("青", "blue"),
])
def test_color_selection_parametrized(demo_page: Page, color: str, expected_param: str):
    """パラメータ化テスト：各色のURLパラメータ確認"""
    demo_page.get_by_role("button", name=color, exact=True).click()
    expect(demo_page).to_have_url(re.compile(f".*color={expected_param}"))
