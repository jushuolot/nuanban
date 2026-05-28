-- 暖伴勤工 · 初始种子数据（开发环境）

INSERT INTO school_dict (name, sort_order) VALUES
  ('示例大学', 1),
  ('示范职业学院', 2);

INSERT INTO organizations (name, code, address, latitude, longitude) VALUES
  ('阳光养老院', 'ORG001', '示例市示例路1号', 31.2304000, 121.4737000),
  ('康乐社区养老站', 'ORG002', '示例市康乐街88号', 31.2350000, 121.4800000);

INSERT INTO service_category (code, name, sort_order) VALUES
  ('COMPANION', '陪伴交流', 1),
  ('DAILY', '生活协助', 2),
  ('RECREATION', '文娱活动', 3),
  ('OUTDOOR', '外出陪同', 4),
  ('ERRAND', '代办跑腿', 5),
  ('REMINDER', '关怀提醒', 6),
  ('GROUP', '小组服务', 7);

INSERT INTO service_item (category_id, name, duration_minutes, is_outdoor, base_price_cents, outdoor_extra_cents)
SELECT c.id, '陪伴交流·2小时', 120, FALSE, 8000, 0 FROM service_category c WHERE c.code = 'COMPANION'
UNION ALL
SELECT c.id, '生活协助·2小时', 120, FALSE, 9000, 0 FROM service_category c WHERE c.code = 'DAILY'
UNION ALL
SELECT c.id, '外出陪同·3小时', 180, TRUE, 12000, 3000 FROM service_category c WHERE c.code = 'OUTDOOR';

INSERT INTO school_cooperation (school_id, org_id)
SELECT s.id, o.id FROM school_dict s, organizations o WHERE s.name = '示例大学' AND o.code = 'ORG001';

INSERT INTO platform_config (key, value) VALUES
  ('match.default_radius_km', '5'),
  ('order.payment_timeout_minutes', '120'),
  ('order.student_accept_timeout_minutes', '15'),
  ('order.auto_confirm_hours', '24'),
  ('feature.elder_self_order', 'true');
