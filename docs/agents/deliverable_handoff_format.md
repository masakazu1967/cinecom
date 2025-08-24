# 成果物引き継ぎフォーマット標準

## 概要

エージェント間での成果物引き継ぎを効率化・標準化するためのフォーマット定義と引き継ぎプロセスを規定します。

## 1. 基本引き継ぎフォーマット

### 標準テンプレート

```yaml
# 成果物引き継ぎ情報 (deliverable-handoff.yaml)

basic_info:
  creator_agent: "agent_name"
  creation_date: "2025-08-22T14:30:00Z"
  version: "v1.0"
  status: "completed|in_progress|review_pending"
  phase: "Phase 1"
  milestone: "要求分析完了"

deliverables:
  primary:
    - path: "docs/project/requirements_analysis.md"
      type: "document"
      description: "要求分析書"
      format: "markdown"
      size: "15KB"
      checksum: "sha256:abc123..."

  secondary:
    - path: "docs/project/requirements_issues.md"
      type: "document"
      description: "課題・懸念事項リスト"
      format: "markdown"
      size: "3KB"
      checksum: "sha256:def456..."

input_resources:
  - path: "docs/project/charter.md"
    type: "source_document"
    version: "v1.2"
    usage: "プロジェクト基本要件の抽出"

  - path: "docs/meetings/stakeholder_interviews/"
    type: "source_data"
    item_count: 3
    usage: "ステークホルダー要求の分析"

quality_check:
  passed_criteria:
    - "要求の明確性"
    - "測定可能性"
    - "ステークホルダー承認可能性"

  failed_criteria: []

  pending_criteria:
    - name: "MVP範囲明確化"
      reason: "詳細仕様化が後続フェーズで必要"
      resolution_plan: "要件定義フェーズで解決"

handoff_instructions:
  next_agents:
    - agent: "requirements_definition"
      priority: "high"
      instructions: "不明確な要求の明確化を優先"
      dependencies: ["requirements_analysis.md", "requirements_issues.md"]

    - agent: "architect"
      priority: "medium"
      instructions: "マイクロサービス分割指針の検討"
      dependencies: ["requirements_analysis.md"]

unresolved_issues:
  - id: "REQ-001"
    title: "シーン分類の粒度決定"
    description: "戦闘・ロマンス・アクション等の分類をどの粒度で行うか未確定"
    severity: "medium"
    assigned_to: "requirements_definition"
    resolution_deadline: "2025-08-25"

  - id: "REQ-002"
    title: "外部API連携可能性"
    description: "TMDB等の外部映画APIとの連携可能性を検討する必要"
    severity: "low"
    assigned_to: "architect"
    resolution_deadline: "2025-08-30"

recommended_actions:
  immediate:
    - action: "要件定義エージェントによる詳細要件定義開始"
      priority: "critical"
      estimated_duration: "2-3 days"

  parallel:
    - action: "技術調査タスクの並列実行"
      agents: ["architect", "database", "devops"]
      estimated_duration: "1-2 days"

  follow_up:
    - action: "ステークホルダーレビューの実施"
      trigger: "要件定義完了後"
      participants: ["product_owner", "technical_lead"]

related_resources:
  documentation:
    - "docs/project/charter.md"
    - ".claude/agents/requirements_definition.md"

  templates:
    - "docs/project/requirements_definition_template.md"

  tools:
    - "scripts/requirement_validator.py"
```

## 2. エージェント別引き継ぎ特化フォーマット

### 要求分析エージェント → 要件定義エージェント

```yaml
# requirements_analysis_handoff.yaml

specialized_handoff:
  functional_requirements:
    categorized:
      user_management:
        - "ユーザー登録・認証"
        - "プロフィール管理"
      movie_catalog:
        - "映画検索・一覧表示"
        - "詳細情報表示"
      scene_management:
        - "シーン分類・タグ付け"
        - "シーンベース検索"

    priority_matrix:
      must_have: ["基本認証", "映画検索", "シーン表示"]
      should_have: ["高度検索", "レビュー機能"]
      could_have: ["推薦機能", "ソーシャル機能"]

  non_functional_requirements:
    performance:
      response_time: "< 500ms (90パーセンタイル)"
      throughput: "> 1000 req/sec"
      availability: "> 99.9%"

    scalability:
      concurrent_users: "< 10,000"
      data_volume: "< 100万映画、1000万シーン"

    security:
      authentication: "OAuth2 + JWT"
      data_protection: "個人情報暗号化"

  ambiguity_resolution_needed:
    - item: "シーン分類の階層構造"
      current_state: "大分類のみ定義済み"
      required_detail: "中分類・小分類の具体化"
      stakeholder_input_needed: true

    - item: "検索機能の範囲"
      current_state: "基本検索要件のみ"
      required_detail: "詳細検索・フィルタ機能の仕様"
      stakeholder_input_needed: false

  stakeholder_feedback:
    resolved_concerns:
      - "データプライバシーの取り扱い → OAuth2認証で解決"
      - "システム可用性 → 99.9% SLA設定で合意"

    pending_decisions:
      - "外部API利用の可否 → 技術調査後に判断"
      - "多言語対応の必要性 → MVP後の検討"
```

### アーキテクトエージェント → バックエンドエージェント

```yaml
# architect_backend_handoff.yaml

specialized_handoff:
  system_architecture:
    microservices:
      user_service:
        responsibilities: ["認証", "プロフィール管理"]
        technology_stack: "NestJS + PostgreSQL"
        api_endpoints: ["/auth", "/users", "/profiles"]

      movie_service:
        responsibilities: ["映画データ管理", "検索機能"]
        technology_stack: "NestJS + PostgreSQL + Redis"
        api_endpoints: ["/movies", "/search"]

      scene_service:
        responsibilities: ["シーン管理", "分類システム"]
        technology_stack: "NestJS + PostgreSQL"
        api_endpoints: ["/scenes", "/categories"]

  api_specifications:
    design_principles:
      - "RESTful設計の徹底"
      - "統一的なエラーレスポンス"
      - "GraphQLの部分採用（複雑なクエリ用）"

    authentication_flow:
      strategy: "JWT + Refresh Token"
      token_expiry: "15分 (access), 7日 (refresh)"
      authorization_header: "Bearer {token}"

    data_formats:
      request: "application/json"
      response: "application/json"
      date_format: "ISO 8601"
      pagination: "cursor-based"

  database_design_constraints:
    partitioning_strategy: "サービス別データベース分離"
    consistency_model: "最終的整合性（サービス間）"
    backup_strategy: "日次フルバックアップ + 継続的WAL"

  implementation_priorities:
    phase1: ["user-service認証機能", "movie-service基本CRUD"]
    phase2: ["scene-service実装", "サービス間連携"]
    phase3: ["検索最適化", "キャッシュ導入"]

  technical_decisions:
    orm_choice: "TypeORM (型安全性重視)"
    validation: "class-validator + class-transformer"
    testing_strategy: "Jest + Supertest + Test Containers"
    monitoring: "Prometheus + Grafana"

  integration_requirements:
    service_discovery: "環境変数ベース設定"
    load_balancing: "Render内蔵ロードバランサー利用"
    circuit_breaker: "オプション（Phase2で検討）"

  non_functional_implementation:
    logging:
      format: "JSON構造化ログ"
      levels: "error, warn, info, debug"
      rotation: "日次ローテーション"

    error_handling:
      global_filter: "全サービス共通エラーフィルター"
      custom_exceptions: "ビジネスロジック例外の統一"
      monitoring: "Sentry統合"
```

### フロントエンドエージェント → テストエージェント

```yaml
# frontend_test_handoff.yaml

specialized_handoff:
  implementation_details:
    component_architecture:
      framework: "Next.js 14 + React 18"
      styling: "Tailwind CSS + Headless UI"
      state_management: "Zustand + SWR"
      form_handling: "React Hook Form"

    component_inventory:
      pages:
        - "/movies (映画一覧・検索)"
        - "/movies/[id] (映画詳細)"
        - "/scenes (シーン検索)"
        - "/auth (認証)"

      components:
        - "MovieCard (映画カード)"
        - "SearchBar (検索バー)"
        - "SceneFilter (シーンフィルター)"
        - "AuthForm (認証フォーム)"

  testing_requirements:
    unit_testing:
      framework: "Jest + React Testing Library"
      coverage_target: "> 80%"
      test_files: "*.test.tsx pattern"

      priority_components:
        - "SearchBar (複雑なロジック)"
        - "AuthForm (セキュリティ重要)"
        - "MovieCard (再利用頻度高)"

    integration_testing:
      api_integration: "MSW (Mock Service Worker)"
      test_scenarios:
        - "映画検索フロー"
        - "ユーザー認証フロー"
        - "シーンフィルタリング"

    e2e_testing:
      framework: "Playwright"
      test_environments: ["development", "staging"]

      critical_paths:
        - "ユーザー登録 → ログイン → 映画検索"
        - "映画詳細閲覧 → シーン探索"
        - "レスポンシブ動作確認"

  accessibility_testing:
    wcag_level: "AA準拠"
    testing_tools: ["axe-playwright", "jest-axe"]
    focus_areas: ["キーボードナビゲーション", "スクリーンリーダー対応"]

  performance_testing:
    metrics:
      lighthouse_score: "> 90 (Performance)"
      core_web_vitals: "Good範囲内"
      bundle_size: "< 500KB (gzipped)"

    testing_tools: ["Lighthouse CI", "Bundle Analyzer"]

  browser_compatibility:
    target_browsers:
      - "Chrome 90+"
      - "Firefox 88+"
      - "Safari 14+"
      - "Edge 90+"

    mobile_testing:
      - "iOS Safari"
      - "Android Chrome"
```

## 3. 品質保証のための引き継ぎチェックリスト

### 引き継ぎ前必須確認項目

```yaml
completeness_check:
  deliverables:
    - [ ] 全ての期待する成果物が作成されている
    - [ ] ファイルサイズ・形式が適切である
    - [ ] チェックサムによる整合性確認済み

  documentation:
    - [ ] 成果物の説明が明確である
    - [ ] 使用方法・前提条件が記載されている
    - [ ] 制約条件・注意事項が明記されている

  quality:
    - [ ] 定義された品質基準をクリアしている
    - [ ] 品質チェックの結果が記録されている
    - [ ] 未クリア項目の対応計画が明確である

handoff_readiness:
  next_agent_preparation:
    - [ ] 後続エージェントが明確に特定されている
    - [ ] 引き継ぎ指示が具体的である
    - [ ] 依存関係が正しく記載されている

  issue_management:
    - [ ] 未解決課題が全て記録されている
    - [ ] 各課題の責任者・期限が明確である
    - [ ] 課題の優先度・影響度が評価されている

  action_planning:
    - [ ] 推奨アクションが具体的である
    - [ ] 実行優先度が明確である
    - [ ] 見積もり時間が妥当である
```

### 引き継ぎ後確認プロセス

```yaml
receipt_confirmation:
  automatic_checks:
    - "ファイル存在確認"
    - "フォーマット妥当性検証"
    - "依存関係解決確認"

  manual_reviews:
    - "成果物内容の理解確認"
    - "不明点・疑問点の特定"
    - "追加情報要求の判断"

feedback_process:
  clarification_requests:
    format: "GitHub Issue"
    template: "引き継ぎ情報明確化依頼"
    response_sla: "4時間以内"

  acceptance_confirmation:
    method: "引き継ぎ確認コメント"
    required_items:
      - "成果物の確認完了"
      - "引き継ぎ指示の理解"
      - "作業開始可能性の確認"
```

## 4. 自動化ツール・支援システム

### 引き継ぎ情報生成ツール

```python
# deliverable_handoff_generator.py

class HandoffGenerator:
    def generate_handoff_document(self, agent_name, deliverables, context):
        """標準フォーマットでの引き継ぎ文書生成"""

        template = self.load_template(agent_name)

        handoff_data = {
            "basic_info": self.extract_basic_info(context),
            "deliverables": self.analyze_deliverables(deliverables),
            "quality_check": self.run_quality_checks(deliverables),
            "handoff_instructions": self.generate_instructions(context),
            "unresolved_issues": self.extract_issues(context),
            "recommended_actions": self.plan_next_actions(context)
        }

        return template.render(handoff_data)

    def validate_handoff_completeness(self, handoff_document):
        """引き継ぎ情報の完全性検証"""

        required_sections = [
            "basic_info", "deliverables", "quality_check",
            "handoff_instructions", "recommended_actions"
        ]

        validation_results = {}
        for section in required_sections:
            validation_results[section] = self.validate_section(
                handoff_document, section
            )

        return validation_results
```

### 品質チェック自動化

```python
# quality_checker.py

class QualityChecker:
    def __init__(self):
        self.criteria_definitions = self.load_quality_criteria()

    def check_deliverable_quality(self, deliverable_path, agent_type):
        """成果物の品質自動チェック"""

        criteria = self.criteria_definitions[agent_type]
        results = {}

        for criterion in criteria:
            checker_method = getattr(self, f"check_{criterion['type']}")
            results[criterion['name']] = checker_method(
                deliverable_path, criterion['parameters']
            )

        return self.generate_quality_report(results)

    def check_document_structure(self, file_path, required_sections):
        """ドキュメント構造の妥当性チェック"""

        content = self.read_file(file_path)
        found_sections = self.extract_sections(content)

        return {
            "missing_sections": set(required_sections) - set(found_sections),
            "extra_sections": set(found_sections) - set(required_sections),
            "completeness_score": len(found_sections) / len(required_sections)
        }
```

### 引き継ぎ通知システム

```python
# handoff_notification.py

class HandoffNotificationSystem:
    def notify_handoff_ready(self, from_agent, to_agents, handoff_document):
        """引き継ぎ準備完了通知"""

        notification_data = {
            "from_agent": from_agent,
            "deliverables": handoff_document.deliverables,
            "priority": handoff_document.priority,
            "deadline": handoff_document.recommended_actions.immediate[0].deadline
        }

        for agent in to_agents:
            self.send_notification(agent, notification_data)
            self.create_github_issue(agent, notification_data)

    def track_handoff_progress(self, handoff_id):
        """引き継ぎ進捗追跡"""

        status = self.get_handoff_status(handoff_id)

        if status.pending_for > datetime.timedelta(hours=24):
            self.send_escalation_alert(handoff_id)

        return status
```

## 5. テンプレート集

### 基本テンプレート

```markdown
# 成果物引き継ぎ: {{agent_name}} → {{next_agent}}

## 📋 基本情報
- **作成エージェント**: {{creator_agent}}
- **作成日時**: {{creation_date}}
- **フェーズ**: {{phase}}
- **ステータス**: {{status}}

## 📦 成果物
{{#each deliverables}}
- **{{description}}**: `{{path}}`
  - 形式: {{format}}
  - サイズ: {{size}}
  - 品質チェック: {{quality_status}}
{{/each}}

## ✅ 品質確認
{{#each quality_check.passed_criteria}}
- ✅ {{this}}
{{/each}}

{{#if quality_check.failed_criteria}}
## ⚠️ 未達成項目
{{#each quality_check.failed_criteria}}
- ❌ {{this}}
{{/each}}
{{/if}}

## 🔄 引き継ぎ指示
{{#each handoff_instructions.next_agents}}
### {{agent}} (優先度: {{priority}})
{{instructions}}

**必要ファイル**:
{{#each dependencies}}
- {{this}}
{{/each}}
{{/each}}

## 🚨 未解決課題
{{#each unresolved_issues}}
### {{id}}: {{title}}
{{description}}
- **担当**: {{assigned_to}}
- **期限**: {{resolution_deadline}}
- **重要度**: {{severity}}
{{/each}}

## 🎯 推奨アクション
{{#each recommended_actions.immediate}}
### 即座に実行
- **内容**: {{action}}
- **優先度**: {{priority}}
- **見積時間**: {{estimated_duration}}
{{/each}}

{{#if recommended_actions.parallel}}
### 並列実行可能
{{#each recommended_actions.parallel}}
- **内容**: {{action}}
- **担当エージェント**: {{agents}}
- **見積時間**: {{estimated_duration}}
{{/each}}
{{/if}}
```

### 技術仕様引き継ぎテンプレート

```yaml
# technical_handoff_template.yaml

technical_specifications:
  architecture_decisions:
    - decision: "{{decision_title}}"
      rationale: "{{decision_rationale}}"
      alternatives_considered: ["{{alt1}}", "{{alt2}}"]
      impact: "{{impact_assessment}}"

  implementation_constraints:
    performance: "{{performance_requirements}}"
    security: "{{security_constraints}}"
    compatibility: "{{compatibility_requirements}}"

  integration_points:
    - service: "{{service_name}}"
      interface: "{{interface_type}}"
      data_format: "{{data_format}}"
      error_handling: "{{error_handling_strategy}}"

code_guidelines:
  style_guide: "{{style_guide_reference}}"
  naming_conventions: "{{naming_conventions}}"
  testing_requirements: "{{testing_strategy}}"
  documentation_standards: "{{documentation_format}}"

deployment_considerations:
  environment_setup: "{{environment_requirements}}"
  configuration_management: "{{config_strategy}}"
  monitoring_requirements: "{{monitoring_setup}}"
  rollback_procedures: "{{rollback_plan}}"
```

---

**作成日**: 2025年8月22日
**最終更新**: 2025年8月22日
**目的**: エージェント間成果物引き継ぎの標準化・効率化
**対象**: 全プロジェクトメンバー・エージェント
**次回レビュー**: 実際の開発フローでの運用開始時
