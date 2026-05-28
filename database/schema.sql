-- 暖伴勤工 · PostgreSQL DDL
-- 单小程序 + Web 管理端 + 平台结算

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========== 枚举类型 ==========
CREATE TYPE user_role_type AS ENUM ('elder', 'family', 'student', 'org_admin', 'platform_admin');
CREATE TYPE user_role_status AS ENUM ('pending', 'active', 'rejected', 'disabled');
CREATE TYPE place_type AS ENUM ('institution', 'community_site', 'home');
CREATE TYPE order_source_type AS ENUM ('elder_self', 'family', 'admin_assign', 'student_apply');
CREATE TYPE order_status_type AS ENUM (
  'draft',
  'pending_payment',
  'pending_accept',
  'outdoor_pending',
  'pending_service',
  'in_service',
  'pending_confirm',
  'completed',
  'cancelled',
  'refunding'
);
CREATE TYPE schedule_status_type AS ENUM (
  'pending_accept',
  'outdoor_pending',
  'pending_service',
  'in_service',
  'pending_confirm',
  'completed',
  'cancelled'
);
CREATE TYPE payment_status_type AS ENUM ('unpaid', 'paid', 'refunding', 'refunded');
CREATE TYPE settlement_status_type AS ENUM ('pending', 'processing', 'paid', 'failed');
CREATE TYPE outdoor_approval_status AS ENUM ('pending_family', 'pending_org', 'approved', 'rejected');
CREATE TYPE export_task_status AS ENUM ('pending', 'processing', 'done', 'failed');

-- ========== 学校字典（非租户） ==========
CREATE TABLE school_dict (
  id            BIGSERIAL PRIMARY KEY,
  name          VARCHAR(128) NOT NULL UNIQUE,
  sort_order    INT NOT NULL DEFAULT 0,
  enabled       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========== 机构（养老院/福利院） ==========
CREATE TABLE organizations (
  id            BIGSERIAL PRIMARY KEY,
  name          VARCHAR(256) NOT NULL,
  code          VARCHAR(64) UNIQUE,
  address       VARCHAR(512),
  latitude      DECIMAL(10, 7),
  longitude     DECIMAL(10, 7),
  service_radius_km DECIMAL(5, 2) DEFAULT 5.0,
  contact_name  VARCHAR(64),
  contact_phone VARCHAR(32),
  enabled       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE communities (
  id              BIGSERIAL PRIMARY KEY,
  org_id          BIGINT NOT NULL REFERENCES organizations(id),
  name            VARCHAR(256) NOT NULL,
  address         VARCHAR(512),
  latitude        DECIMAL(10, 7),
  longitude       DECIMAL(10, 7),
  enabled         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========== 院校合作 ==========
CREATE TABLE school_cooperation (
  id            BIGSERIAL PRIMARY KEY,
  school_id     BIGINT NOT NULL REFERENCES school_dict(id),
  org_id        BIGINT NOT NULL REFERENCES organizations(id),
  enabled       BOOLEAN NOT NULL DEFAULT TRUE,
  valid_from    DATE,
  valid_to      DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (school_id, org_id)
);

CREATE TABLE school_designated_elder (
  id            BIGSERIAL PRIMARY KEY,
  school_id     BIGINT NOT NULL REFERENCES school_dict(id),
  org_id        BIGINT NOT NULL REFERENCES organizations(id),
  elder_id      BIGINT NOT NULL, -- FK added after elders
  project_name  VARCHAR(128),
  enabled       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (school_id, elder_id)
);

-- ========== 用户 ==========
CREATE TABLE users (
  id            BIGSERIAL PRIMARY KEY,
  phone         VARCHAR(20) UNIQUE,
  nickname      VARCHAR(64),
  avatar_url    VARCHAR(512),
  status        VARCHAR(32) NOT NULL DEFAULT 'active',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_wechat (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  openid        VARCHAR(64) NOT NULL UNIQUE,
  unionid       VARCHAR(64),
  session_key   VARCHAR(128),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_roles (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role          user_role_type NOT NULL,
  status        user_role_status NOT NULL DEFAULT 'pending',
  org_id        BIGINT REFERENCES organizations(id), -- org_admin 时必填
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- ========== 老人 ==========
CREATE TABLE elders (
  id                BIGSERIAL PRIMARY KEY,
  user_id           BIGINT UNIQUE REFERENCES users(id),
  org_id            BIGINT NOT NULL REFERENCES organizations(id),
  community_id      BIGINT REFERENCES communities(id),
  display_name      VARCHAR(64) NOT NULL,
  gender            VARCHAR(8),
  birth_year        INT,
  phone             VARCHAR(20),
  place_type        place_type NOT NULL DEFAULT 'institution',
  address           VARCHAR(512),
  latitude          DECIMAL(10, 7),
  longitude         DECIMAL(10, 7),
  emergency_contact VARCHAR(64),
  emergency_phone   VARCHAR(20),
  no_outdoor        BOOLEAN NOT NULL DEFAULT FALSE,
  notes             TEXT,
  enabled           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE school_designated_elder
  ADD CONSTRAINT fk_sde_elder FOREIGN KEY (elder_id) REFERENCES elders(id);

CREATE TABLE family_elder (
  id            BIGSERIAL PRIMARY KEY,
  family_user_id BIGINT NOT NULL REFERENCES users(id),
  elder_id      BIGINT NOT NULL REFERENCES elders(id),
  relation      VARCHAR(32),
  is_primary_payer BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (family_user_id, elder_id)
);

-- ========== 学生 ==========
CREATE TABLE students (
  id                BIGSERIAL PRIMARY KEY,
  user_id           BIGINT NOT NULL UNIQUE REFERENCES users(id),
  school_id         BIGINT REFERENCES school_dict(id),
  school_name       VARCHAR(128),
  college           VARCHAR(128),
  student_no        VARCHAR(64),
  grade             VARCHAR(32),
  intro             TEXT,
  latitude          DECIMAL(10, 7),
  longitude         DECIMAL(10, 7),
  service_radius_km DECIMAL(5, 2) DEFAULT 5.0,
  credit_score      INT NOT NULL DEFAULT 100,
  audit_status      user_role_status NOT NULL DEFAULT 'pending',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE student_service_categories (
  student_id      BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  category_id     BIGINT NOT NULL, -- FK after service_category
  PRIMARY KEY (student_id, category_id)
);

CREATE TABLE student_org_scope (
  student_id      BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  org_id          BIGINT NOT NULL REFERENCES organizations(id),
  PRIMARY KEY (student_id, org_id)
);

CREATE TABLE student_availability (
  id            BIGSERIAL PRIMARY KEY,
  student_id    BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  weekday       SMALLINT NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time    TIME NOT NULL,
  end_time      TIME NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========== 服务分类与 SKU ==========
CREATE TABLE service_category (
  id            BIGSERIAL PRIMARY KEY,
  code          VARCHAR(32) NOT NULL UNIQUE,
  name          VARCHAR(64) NOT NULL,
  description   TEXT,
  sort_order    INT NOT NULL DEFAULT 0,
  enabled       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE student_service_categories
  ADD CONSTRAINT fk_ssc_category FOREIGN KEY (category_id) REFERENCES service_category(id);

CREATE TABLE service_item (
  id              BIGSERIAL PRIMARY KEY,
  category_id     BIGINT NOT NULL REFERENCES service_category(id),
  name            VARCHAR(128) NOT NULL,
  description     TEXT,
  duration_minutes INT NOT NULL DEFAULT 120,
  is_outdoor      BOOLEAN NOT NULL DEFAULT FALSE,
  is_group        BOOLEAN NOT NULL DEFAULT FALSE,
  base_price_cents BIGINT NOT NULL,
  outdoor_extra_cents BIGINT NOT NULL DEFAULT 0,
  enabled         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE org_service_price (
  id              BIGSERIAL PRIMARY KEY,
  org_id          BIGINT NOT NULL REFERENCES organizations(id),
  service_item_id BIGINT NOT NULL REFERENCES service_item(id),
  price_cents     BIGINT NOT NULL,
  enabled         BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (org_id, service_item_id)
);

CREATE TABLE service_package (
  id              BIGSERIAL PRIMARY KEY,
  org_id          BIGINT REFERENCES organizations(id),
  name            VARCHAR(128) NOT NULL,
  service_item_id BIGINT NOT NULL REFERENCES service_item(id),
  total_times     INT NOT NULL,
  price_cents     BIGINT NOT NULL,
  valid_days      INT NOT NULL DEFAULT 90,
  enabled         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========== 老人账户（服务包/余额） ==========
CREATE TABLE elder_wallet (
  id            BIGSERIAL PRIMARY KEY,
  elder_id      BIGINT NOT NULL UNIQUE REFERENCES elders(id),
  balance_cents BIGINT NOT NULL DEFAULT 0,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE elder_package_ledger (
  id              BIGSERIAL PRIMARY KEY,
  elder_id        BIGINT NOT NULL REFERENCES elders(id),
  package_id      BIGINT NOT NULL REFERENCES service_package(id),
  remaining_times INT NOT NULL,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE wallet_ledger (
  id            BIGSERIAL PRIMARY KEY,
  elder_id      BIGINT NOT NULL REFERENCES elders(id),
  change_cents  BIGINT NOT NULL,
  balance_after BIGINT NOT NULL,
  ref_type      VARCHAR(32) NOT NULL,
  ref_id        BIGINT,
  remark        VARCHAR(256),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========== 订单 ==========
CREATE TABLE orders (
  id                BIGSERIAL PRIMARY KEY,
  order_no          VARCHAR(32) NOT NULL UNIQUE,
  elder_id          BIGINT NOT NULL REFERENCES elders(id),
  family_user_id    BIGINT REFERENCES users(id),
  student_id        BIGINT REFERENCES students(id),
  service_item_id   BIGINT NOT NULL REFERENCES service_item(id),
  order_source      order_source_type NOT NULL,
  initiator_user_id BIGINT REFERENCES users(id),
  status            order_status_type NOT NULL DEFAULT 'draft',
  payment_status    payment_status_type NOT NULL DEFAULT 'unpaid',
  place_type        place_type NOT NULL,
  scheduled_start   TIMESTAMPTZ NOT NULL,
  scheduled_end     TIMESTAMPTZ,
  amount_total_cents BIGINT NOT NULL DEFAULT 0,
  amount_student_cents BIGINT NOT NULL DEFAULT 0,
  amount_org_cents  BIGINT NOT NULL DEFAULT 0,
  amount_platform_cents BIGINT NOT NULL DEFAULT 0,
  distance_km       DECIMAL(6, 2),
  remark            TEXT,
  paid_at           TIMESTAMPTZ,
  cancelled_at      TIMESTAMPTZ,
  cancel_reason     VARCHAR(256),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_elder ON orders(elder_id);
CREATE INDEX idx_orders_student ON orders(student_id);
CREATE INDEX idx_orders_status ON orders(status);

CREATE TABLE schedules (
  id            BIGSERIAL PRIMARY KEY,
  order_id      BIGINT NOT NULL UNIQUE REFERENCES orders(id),
  elder_id      BIGINT NOT NULL REFERENCES elders(id),
  student_id    BIGINT NOT NULL REFERENCES students(id),
  org_id        BIGINT NOT NULL REFERENCES organizations(id),
  status        schedule_status_type NOT NULL,
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE outdoor_approvals (
  id            BIGSERIAL PRIMARY KEY,
  order_id      BIGINT NOT NULL UNIQUE REFERENCES orders(id),
  status        outdoor_approval_status NOT NULL DEFAULT 'pending_family',
  family_user_id BIGINT REFERENCES users(id),
  family_approved_at TIMESTAMPTZ,
  org_admin_user_id BIGINT REFERENCES users(id),
  org_approved_at TIMESTAMPTZ,
  rejected_reason VARCHAR(256),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE checkins (
  id            BIGSERIAL PRIMARY KEY,
  schedule_id   BIGINT NOT NULL REFERENCES schedules(id),
  checkin_type  VARCHAR(32) NOT NULL, -- depart | arrive | finish | indoor_in | indoor_out
  latitude      DECIMAL(10, 7),
  longitude     DECIMAL(10, 7),
  photo_url     VARCHAR(512),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE service_logs (
  id            BIGSERIAL PRIMARY KEY,
  schedule_id   BIGINT NOT NULL REFERENCES schedules(id),
  student_id    BIGINT NOT NULL REFERENCES students(id),
  content       JSONB NOT NULL DEFAULT '{}',
  summary       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE confirmations (
  id            BIGSERIAL PRIMARY KEY,
  order_id      BIGINT NOT NULL UNIQUE REFERENCES orders(id),
  elder_user_id BIGINT NOT NULL REFERENCES users(id),
  confirmed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ratings (
  id            BIGSERIAL PRIMARY KEY,
  order_id      BIGINT NOT NULL REFERENCES orders(id),
  from_role     user_role_type NOT NULL,
  from_user_id  BIGINT NOT NULL REFERENCES users(id),
  to_student_id BIGINT REFERENCES students(id),
  score         SMALLINT NOT NULL CHECK (score BETWEEN 1 AND 5),
  content       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========== 结算 ==========
CREATE TABLE settlements (
  id            BIGSERIAL PRIMARY KEY,
  batch_no      VARCHAR(32) NOT NULL UNIQUE,
  status        settlement_status_type NOT NULL DEFAULT 'pending',
  total_cents   BIGINT NOT NULL DEFAULT 0,
  settled_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE settlement_lines (
  id            BIGSERIAL PRIMARY KEY,
  settlement_id BIGINT NOT NULL REFERENCES settlements(id),
  student_id    BIGINT NOT NULL REFERENCES students(id),
  order_id      BIGINT NOT NULL REFERENCES orders(id),
  amount_cents  BIGINT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE refunds (
  id            BIGSERIAL PRIMARY KEY,
  order_id      BIGINT NOT NULL REFERENCES orders(id),
  applicant_user_id BIGINT NOT NULL REFERENCES users(id),
  amount_cents  BIGINT NOT NULL,
  reason        TEXT,
  status        VARCHAR(32) NOT NULL DEFAULT 'pending',
  reviewed_by   BIGINT REFERENCES users(id),
  reviewed_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========== 导出 ==========
CREATE TABLE export_tasks (
  id            BIGSERIAL PRIMARY KEY,
  created_by    BIGINT NOT NULL REFERENCES users(id),
  org_id        BIGINT REFERENCES organizations(id),
  export_type   VARCHAR(64) NOT NULL,
  filters       JSONB NOT NULL DEFAULT '{}',
  status        export_task_status NOT NULL DEFAULT 'pending',
  row_count     INT,
  file_url      VARCHAR(512),
  expires_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE export_audit_logs (
  id            BIGSERIAL PRIMARY KEY,
  task_id       BIGINT REFERENCES export_tasks(id),
  user_id       BIGINT NOT NULL REFERENCES users(id),
  export_type   VARCHAR(64) NOT NULL,
  filters       JSONB,
  row_count     INT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========== 投诉与消息 ==========
CREATE TABLE complaints (
  id            BIGSERIAL PRIMARY KEY,
  order_id      BIGINT REFERENCES orders(id),
  from_user_id  BIGINT NOT NULL REFERENCES users(id),
  target_type   VARCHAR(32),
  target_id     BIGINT,
  content       TEXT NOT NULL,
  status        VARCHAR(32) NOT NULL DEFAULT 'open',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE messages (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT NOT NULL REFERENCES users(id),
  title         VARCHAR(128) NOT NULL,
  body          TEXT,
  payload       JSONB,
  read_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========== 平台配置 ==========
CREATE TABLE platform_config (
  key           VARCHAR(64) PRIMARY KEY,
  value         JSONB NOT NULL,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========== 索引补充 ==========
CREATE INDEX idx_elders_org ON elders(org_id);
CREATE INDEX idx_students_school ON students(school_id);
CREATE INDEX idx_schedules_student ON schedules(student_id, scheduled_start);
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
