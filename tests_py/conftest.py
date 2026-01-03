"""
pytest設定ファイル
Playwrightとバックエンドテストの共通フィクスチャを定義
"""
import pytest
from playwright.sync_api import Page, expect

# Playwrightのフィクスチャは pytest-playwright が自動的に提供
# 以下のフィクスチャが利用可能:
# - page: ブラウザページ
# - context: ブラウザコンテキスト
# - browser: ブラウザインスタンス


@pytest.fixture(scope="session")
def browser_context_args(browser_context_args):
    """
    ブラウザコンテキストの設定をカスタマイズ
    """
    return {
        **browser_context_args,
        "viewport": {"width": 1280, "height": 720},
        "locale": "ja-JP",
        "timezone_id": "Asia/Tokyo",
    }


@pytest.fixture
def demo_page(page: Page):
    """
    デモページに移動済みのPageフィクスチャ
    """
    page.goto("/demo")
    return page


@pytest.fixture
def home_page(page: Page):
    """
    ホームページに移動済みのPageフィクスチャ
    """
    page.goto("/")
    return page


# バックエンド統合用のフィクスチャ例
# 実際のプロジェクトに合わせて実装してください

# @pytest.fixture(scope="session")
# def db_session():
#     """データベースセッション"""
#     from your_backend.database import SessionLocal
#     session = SessionLocal()
#     yield session
#     session.close()


# @pytest.fixture
# def test_user(db_session):
#     """テスト用ユーザーを作成"""
#     from your_backend.models import User
#     user = User(email="test@example.com", name="テスト太郎")
#     db_session.add(user)
#     db_session.commit()
#     yield user
#     db_session.delete(user)
#     db_session.commit()


# ページオブジェクトのフィクスチャ
@pytest.fixture
def demo_page_object(page: Page):
    """Page Object Modelを使用したデモページ"""
    from pages.demo_page import DemoPage
    demo = DemoPage(page)
    demo.goto()
    return demo
