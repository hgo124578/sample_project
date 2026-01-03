"""
ホームページのテスト
JavaScript版 tests/home.spec.js のPython移植版
"""
import re
import pytest
from playwright.sync_api import Page, expect


@pytest.mark.e2e
class TestHomePage:
    """ホームページのテストスイート"""

    def test_home_page_displays_correctly(self, page: Page):
        """ホームページが正しく表示される"""
        # Arrange & Act
        page.goto("/")

        # Assert
        expect(page).to_have_title(re.compile(r"Next\.js"))

        heading = page.get_by_role("heading", name="Hello World!")
        expect(heading).to_be_visible()

        description = page.get_by_text("Next.js v15 基礎学習用プロジェクトへようこそ")
        expect(description).to_be_visible()

    def test_link_to_about_page(self, page: Page):
        """アバウトページへのリンクが機能する"""
        # Arrange
        page.goto("/")

        # Act
        page.get_by_role("link", name="アバウトページへ").click()

        # Assert
        expect(page).to_have_url(re.compile(r".*/about"))

        heading = page.get_by_role("heading", name="アバウトページ")
        expect(heading).to_be_visible()

    def test_link_to_demo_page(self, page: Page):
        """デモページへのリンクが機能する"""
        # Arrange
        page.goto("/")

        # Act
        page.get_by_role("link", name=r"デモページへ").click()

        # Assert
        expect(page).to_have_url(re.compile(r".*/demo"))

        heading = page.get_by_role("heading", name="シャローローティング デモ")
        expect(heading).to_be_visible()


@pytest.mark.e2e
@pytest.mark.smoke
def test_home_page_smoke(page: Page):
    """ホームページのスモークテスト（最小限の確認）"""
    page.goto("/")
    expect(page.get_by_role("heading", name="Hello World!")).to_be_visible()
