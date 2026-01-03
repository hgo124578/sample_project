"""
Page Object Modelを使用したデモページのテスト
"""
import re
import pytest
from playwright.sync_api import Page, expect
from pages.demo_page import DemoPage


@pytest.mark.e2e
class TestDemoWithPOM:
    """Page Object Modelを使用したテスト例"""

    def test_increment_counter(self, page: Page):
        """カウンターを増やす"""
        # Arrange
        demo_page = DemoPage(page)
        demo_page.goto()

        # Act
        demo_page.increment_counter(3)

        # Assert
        expect(demo_page.counter).to_have_text("3")

    def test_reset_counter(self, page: Page):
        """カウンターをリセット"""
        # Arrange
        demo_page = DemoPage(page)
        demo_page.goto()
        demo_page.increment_counter(10)
        expect(demo_page.counter).to_have_text("10")

        # Act
        demo_page.reset_counter()

        # Assert
        expect(demo_page.counter).to_have_text("0")

    def test_color_selection_preserves_counter(self, page: Page):
        """色選択後もカウンターが保持される"""
        # Arrange
        demo_page = DemoPage(page)
        demo_page.goto()
        demo_page.increment_counter(5)
        expect(demo_page.counter).to_have_text("5")

        # Act
        demo_page.select_color("赤")

        # Assert
        expect(demo_page.counter).to_have_text("5")
        expect(page).to_have_url(re.compile(r".*color=red"))

    @pytest.mark.parametrize("times,expected", [
        (1, "1"),
        (5, "5"),
        (10, "10"),
    ])
    def test_increment_various_times(self, page: Page, times: int, expected: str):
        """様々な回数のインクリメントをテスト"""
        demo_page = DemoPage(page)
        demo_page.goto()

        demo_page.increment_counter(times)

        expect(demo_page.counter).to_have_text(expected)


# フィクスチャを使ったより洗練された例
@pytest.mark.e2e
def test_with_fixture(demo_page_object: DemoPage):
    """フィクスチャでPage Objectを注入"""
    # すでにページに移動済み（conftest.pyのフィクスチャ）
    demo_page_object.increment_counter(3)
    expect(demo_page_object.counter).to_have_text("3")
