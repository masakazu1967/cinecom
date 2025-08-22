#!/usr/bin/env python3
"""
開発フローシミュレーションツール
サブエージェント定義ファイルとプロジェクト憲章から、開発フロー全体をシミュレートし、
各タスクの入力リソース不足を事前に検出する。
"""

import os
import re
import json
from pathlib import Path
from typing import Dict, List, Set, Tuple
from dataclasses import dataclass
from enum import Enum

class TaskStatus(Enum):
    PENDING = "pending"
    READY = "ready"
    RUNNING = "running"
    COMPLETED = "completed"
    BLOCKED = "blocked"

@dataclass
class Resource:
    path: str
    type: str  # file, directory, service
    required: bool = True
    description: str = ""

@dataclass
class Task:
    name: str
    agent: str
    description: str
    inputs: List[Resource]
    outputs: List[Resource]
    dependencies: List[str]
    status: TaskStatus = TaskStatus.PENDING
    phase: int = 1

class FlowSimulator:
    def __init__(self):
        self.agents_dir = Path(".claude/agents")
        self.docs_dir = Path("docs")
        self.tasks: Dict[str, Task] = {}
        self.available_resources: Set[str] = set()
        self.current_phase = 1
        
    def load_agent_definitions(self):
        """サブエージェント定義ファイルから入出力要件を抽出"""
        print("=== サブエージェント定義ファイル解析 ===")
        
        for agent_file in self.agents_dir.glob("*.md"):
            agent_name = agent_file.stem
            content = agent_file.read_text(encoding='utf-8')
            
            print(f"\n📋 {agent_name} エージェント分析中...")
            tasks = self.extract_tasks_from_agent(agent_name, content)
            
            for task in tasks:
                self.tasks[task.name] = task
                print(f"  ✓ タスク: {task.name}")
    
    def extract_tasks_from_agent(self, agent_name: str, content: str) -> List[Task]:
        """エージェント定義から具体的なタスクを抽出"""
        tasks = []
        
        # 具体的タスクセクションを探す
        task_section = re.search(r'## 具体的タスク(.*?)(?=##|$)', content, re.DOTALL)
        if not task_section:
            return tasks
        
        task_content = task_section.group(1)
        
        # タスク定義のパターンを抽出
        task_patterns = [
            # 要求分析エージェント
            (r'基本要求分析', 'requirements_analysis_basic', 1, 
             ['docs/project/charter.md', 'docs/meetings/stakeholder_interviews/'],
             ['docs/project/requirements_analysis.md', 'docs/project/requirements_issues.md']),
            
            # 要件定義エージェント
            (r'要件定義書作成', 'requirements_definition_create', 1,
             ['docs/project/requirements_analysis.md'],
             ['docs/project/requirements.md']),
            
            (r'ユーザーストーリー作成', 'user_stories_create', 1,
             ['docs/project/requirements.md'],
             ['docs/project/user_stories.md']),
            
            # アーキテクトエージェント
            (r'技術スタック調査', 'tech_stack_research', 1,
             [],  # 並列実行可能
             ['docs/architecture/tech_research.md']),
            
            (r'システムアーキテクチャ設計', 'system_design', 2,
             ['docs/project/requirements.md'],
             ['docs/architecture/system_design.md']),
            
            (r'サービス間API仕様設計', 'api_specification', 2,
             ['docs/architecture/system_design.md'],
             ['docs/architecture/api_specification.md']),
            
            # データベースエージェント
            (r'DB技術調査', 'db_tech_research', 1,
             [],  # 並列実行可能
             ['docs/architecture/db_research.md']),
            
            (r'マイクロサービス用DB設計', 'database_design', 2,
             ['docs/architecture/system_design.md', 'docs/architecture/api_specification.md'],
             ['docs/architecture/database_schema.md']),
            
            # UX/UIデザインエージェント
            (r'ワイヤーフレーム作成', 'wireframe_create', 2,
             ['docs/project/user_stories.md'],
             ['docs/design/wireframes/']),
            
            # バックエンドエージェント
            (r'マイクロサービス実装', 'backend_implementation', 2,
             ['docs/architecture/system_design.md', 'docs/architecture/database_schema.md'],
             ['backend/']),
            
            # フロントエンドエージェント
            (r'UI実装', 'frontend_implementation', 2,
             ['docs/design/wireframes/', 'docs/architecture/api_specification.md'],
             ['frontend/']),
            
            # テストエージェント
            (r'マイクロサービステスト作成', 'test_implementation', 3,
             ['backend/', 'frontend/'],
             ['tests/']),
            
            # セキュリティエージェント
            (r'マイクロサービスセキュリティ監査', 'security_audit', 3,
             ['backend/', 'frontend/', 'tests/'],
             ['docs/security/audit_report.md']),
            
            # DevOpsエージェント
            (r'マイクロサービス用CI/CD構築', 'cicd_setup', 3,
             ['backend/', 'frontend/', 'tests/'],
             ['.github/workflows/']),
        ]
        
        for pattern, task_name, phase, inputs, outputs in task_patterns:
            if re.search(pattern, task_content):
                input_resources = [Resource(path=inp, type=self.detect_resource_type(inp)) for inp in inputs]
                output_resources = [Resource(path=out, type=self.detect_resource_type(out)) for out in outputs]
                
                task = Task(
                    name=task_name,
                    agent=agent_name,
                    description=pattern,
                    inputs=input_resources,
                    outputs=output_resources,
                    dependencies=[],  # 後で設定
                    phase=phase
                )
                tasks.append(task)
        
        return tasks
    
    def detect_resource_type(self, path: str) -> str:
        """リソースパスからタイプを判定"""
        if path.endswith('/'):
            return 'directory'
        elif path.endswith('.md'):
            return 'document'
        elif 'service' in path or path in ['backend/', 'frontend/']:
            return 'code'
        else:
            return 'file'
    
    def setup_dependencies(self):
        """タスク間の依存関係を設定"""
        print("\n=== タスク依存関係設定 ===")
        
        # 出力 -> 入力の依存関係マッピング
        output_to_tasks = {}
        for task_name, task in self.tasks.items():
            for output in task.outputs:
                if output.path not in output_to_tasks:
                    output_to_tasks[output.path] = []
                output_to_tasks[output.path].append(task_name)
        
        # 各タスクの依存関係を設定
        for task_name, task in self.tasks.items():
            for input_res in task.inputs:
                if input_res.path in output_to_tasks:
                    for producer_task in output_to_tasks[input_res.path]:
                        if producer_task != task_name:
                            task.dependencies.append(producer_task)
        
        # 依存関係を表示
        for task_name, task in self.tasks.items():
            if task.dependencies:
                print(f"  {task_name} <- {', '.join(task.dependencies)}")
    
    def check_initial_resources(self):
        """初期状態で利用可能なリソースをチェック"""
        print("\n=== 初期リソース確認 ===")
        
        initial_resources = [
            'docs/project/charter.md',
            '.claude/agents/',
            'docs/meetings/stakeholder_interviews/',
        ]
        
        for resource in initial_resources:
            path = Path(resource)
            if path.exists():
                self.available_resources.add(resource)
                print(f"  ✓ {resource}")
            else:
                print(f"  ✗ {resource} (不足)")
    
    def simulate_phase(self, phase: int):
        """指定フェーズのシミュレーション実行"""
        print(f"\n=== Phase {phase} シミュレーション ===")
        
        phase_tasks = [task for task in self.tasks.values() if task.phase == phase]
        
        # タスク実行可能性チェック
        ready_tasks = []
        blocked_tasks = []
        
        for task in phase_tasks:
            if self.can_execute_task(task):
                ready_tasks.append(task)
                task.status = TaskStatus.READY
            else:
                blocked_tasks.append(task)
                task.status = TaskStatus.BLOCKED
        
        # 実行可能タスクの表示
        if ready_tasks:
            print(f"\n📋 実行可能タスク ({len(ready_tasks)}個):")
            for task in ready_tasks:
                print(f"  ✓ {task.name} ({task.agent})")
        
        # ブロックされたタスクの表示
        if blocked_tasks:
            print(f"\n🚫 ブロックされたタスク ({len(blocked_tasks)}個):")
            for task in blocked_tasks:
                missing_inputs = self.get_missing_inputs(task)
                print(f"  ✗ {task.name} ({task.agent})")
                for missing in missing_inputs:
                    print(f"    - 不足: {missing}")
        
        # タスク実行（成功想定）
        for task in ready_tasks:
            self.execute_task_simulation(task)
        
        return len(blocked_tasks) == 0
    
    def can_execute_task(self, task: Task) -> bool:
        """タスクが実行可能かチェック"""
        # 依存タスクが完了しているかチェック
        for dep_task_name in task.dependencies:
            if dep_task_name in self.tasks:
                if self.tasks[dep_task_name].status != TaskStatus.COMPLETED:
                    return False
        
        # 入力リソースが利用可能かチェック
        for input_res in task.inputs:
            if input_res.required and input_res.path not in self.available_resources:
                return False
        
        return True
    
    def get_missing_inputs(self, task: Task) -> List[str]:
        """不足している入力リソースを取得"""
        missing = []
        
        # 依存タスクの確認
        for dep_task_name in task.dependencies:
            if dep_task_name in self.tasks:
                if self.tasks[dep_task_name].status != TaskStatus.COMPLETED:
                    missing.append(f"依存タスク: {dep_task_name}")
        
        # 入力リソースの確認
        for input_res in task.inputs:
            if input_res.required and input_res.path not in self.available_resources:
                missing.append(f"リソース: {input_res.path}")
        
        return missing
    
    def execute_task_simulation(self, task: Task):
        """タスク実行をシミュレート"""
        print(f"  🔄 実行中: {task.name}")
        
        # 出力リソースを利用可能リソースに追加
        for output in task.outputs:
            self.available_resources.add(output.path)
        
        task.status = TaskStatus.COMPLETED
        print(f"  ✅ 完了: {task.name}")
    
    def run_full_simulation(self):
        """全フェーズのシミュレーション実行"""
        print("\n🚀 開発フロー全体シミュレーション開始")
        
        self.load_agent_definitions()
        self.setup_dependencies()
        self.check_initial_resources()
        
        all_phases_success = True
        
        for phase in range(1, 4):
            success = self.simulate_phase(phase)
            if not success:
                print(f"\n❌ Phase {phase} でブロッカーが検出されました！")
                all_phases_success = False
                break
            else:
                print(f"\n✅ Phase {phase} は正常に実行可能です")
        
        return all_phases_success
    
    def generate_preparation_checklist(self):
        """事前準備チェックリストを生成"""
        print("\n=== 事前準備チェックリスト生成 ===")
        
        checklist = []
        
        # 初期リソースの準備
        initial_resources = [
            ('docs/project/charter.md', 'プロジェクト憲章の作成'),
            ('docs/meetings/stakeholder_interviews/', 'ステークホルダーヒアリング議事録の準備'),
            ('.claude/agents/', 'サブエージェント定義ファイルの配置'),
            ('.github/', 'GitHubリポジトリの初期設定'),
        ]
        
        for resource_path, description in initial_resources:
            path = Path(resource_path)
            if not path.exists():
                checklist.append(f"❗ {description} ({resource_path})")
        
        # ディレクトリ構造の準備
        required_dirs = [
            'docs/project',
            'docs/architecture', 
            'docs/design',
            'docs/meetings/stakeholder_interviews',
            'docs/meetings/requirements_sessions',
        ]
        
        for dir_path in required_dirs:
            path = Path(dir_path)
            if not path.exists():
                checklist.append(f"📁 ディレクトリ作成: {dir_path}")
        
        return checklist

def main():
    simulator = FlowSimulator()
    
    # フルシミュレーション実行
    success = simulator.run_full_simulation()
    
    # 準備チェックリスト生成
    checklist = simulator.generate_preparation_checklist()
    
    print("\n" + "="*60)
    if success:
        print("🎉 開発フローシミュレーション: 成功")
        print("   全フェーズが正常に実行可能です")
    else:
        print("⚠️  開発フローシミュレーション: 課題検出")
        print("   ブロッカーが検出されました")
    
    if checklist:
        print(f"\n📋 事前準備が必要な項目 ({len(checklist)}件):")
        for item in checklist:
            print(f"   {item}")
    else:
        print("\n✅ 事前準備は完了しています")
    
    print("\n" + "="*60)

if __name__ == "__main__":
    main()