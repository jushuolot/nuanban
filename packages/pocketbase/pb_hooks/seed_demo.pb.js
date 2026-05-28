/// 一键写入演示数据：POST /api/nuanban/seed-demo?key=nuanban_dev_seed
/// 可重复执行（按名称/邮箱去重，不重复创建）

const SEED_KEY = "nuanban_dev_seed";
const DEV_PASS = "nuanban_dev_2025";

function mustSeedKey(e) {
  const q = e.request.url.query();
  if (q.get("key") !== SEED_KEY) {
    throw new BadRequestError("缺少或错误的 key 参数");
  }
}

function findOne(collection, filter, params) {
  const rows = $app.findRecordsByFilter(collection, filter, "", 1, 0, params || {});
  return rows.length ? rows[0] : null;
}

function findOrCreateBase(collection, filter, params, apply) {
  let rec = findOne(collection, filter, params);
  if (rec) return rec;
  const col = $app.findCollectionByNameOrId(collection);
  rec = new Record(col);
  apply(rec);
  $app.save(rec);
  return rec;
}

function findOrCreateUser(email, name) {
  try {
    return $app.findAuthRecordByEmail("users", email);
  } catch (_) {
    const col = $app.findCollectionByNameOrId("users");
    const u = new Record(col);
    u.set("email", email);
    u.set("password", DEV_PASS);
    u.set("passwordConfirm", DEV_PASS);
    u.set("verified", true);
    u.set("name", name);
    $app.save(u);
    return u;
  }
}

function findOrCreateUserRole(userId, role, extra) {
  const existing = $app.findRecordsByFilter(
    "user_roles",
    'user = {:uid} && role = {:role}',
    "",
    1,
    0,
    { uid: userId, role }
  );
  if (existing.length) return existing[0];
  const col = $app.findCollectionByNameOrId("user_roles");
  const r = new Record(col);
  r.set("user", userId);
  r.set("role", role);
  r.set("status", "active");
  if (extra) {
    Object.keys(extra).forEach((k) => r.set(k, extra[k]));
  }
  $app.save(r);
  return r;
}

routerAdd("POST", "/api/nuanban/seed-demo", (e) => {
  mustSeedKey(e);

  const stats = {
    schools: 0,
    orgs: 0,
    elders: 0,
    students: 0,
    orders: 0,
  };

  // —— 学校 ——
  const schoolNames = ["示范大学", "城东职业学院", "阳光师范学院"];
  const schools = {};
  schoolNames.forEach((name, i) => {
    const s = findOrCreateBase(
      "school_dict",
      'name = {:n}',
      { n: name },
      (r) => {
        r.set("name", name);
        r.set("sort_order", i + 1);
        r.set("enabled", true);
      }
    );
    schools[name] = s;
    stats.schools++;
  });

  // —— 机构 ——
  const orgDefs = [
    { name: "暖伴示范养老院", code: "ORG001", lat: 31.2304, lng: 121.4737 },
    { name: "康乐社区养老站", code: "ORG002", lat: 31.235, lng: 121.48 },
    { name: "夕阳红护理院", code: "ORG003", lat: 31.228, lng: 121.468 },
  ];
  const orgs = {};
  orgDefs.forEach((o) => {
    const rec = findOrCreateBase(
      "organizations",
      'code = {:c}',
      { c: o.code },
      (r) => {
        r.set("name", o.name);
        r.set("code", o.code);
        r.set("latitude", o.lat);
        r.set("longitude", o.lng);
        r.set("service_radius_km", 5);
        r.set("enabled", true);
      }
    );
    orgs[o.code] = rec;
    stats.orgs++;
  });

  // —— 社区 ——
  const comDefs = [
    { org: "ORG001", name: "A区" },
    { org: "ORG001", name: "B区" },
    { org: "ORG002", name: "康乐花园" },
    { org: "ORG003", name: "夕阳楼" },
  ];
  const communities = {};
  comDefs.forEach((c) => {
    const rec = findOrCreateBase(
      "communities",
      'name = {:n} && org = {:oid}',
      { n: c.name, oid: orgs[c.org].id },
      (r) => {
        r.set("org", orgs[c.org].id);
        r.set("name", c.name);
        r.set("latitude", orgs[c.org].getFloat("latitude"));
        r.set("longitude", orgs[c.org].getFloat("longitude"));
        r.set("enabled", true);
      }
    );
    communities[c.org + "_" + c.name] = rec;
  });

  // —— 服务分类 & SKU ——
  const catDefs = [
    { name: "陪伴交流", sort: 1 },
    { name: "生活协助", sort: 2 },
    { name: "文娱活动", sort: 3 },
    { name: "外出陪同", sort: 4 },
    { name: "代办跑腿", sort: 5 },
  ];
  const cats = {};
  catDefs.forEach((c) => {
    const rec = findOrCreateBase(
      "service_categories",
      'name = {:n}',
      { n: c.name },
      (r) => {
        r.set("name", c.name);
        r.set("sort_order", c.sort);
      }
    );
    cats[c.name] = rec;
  });

  const skuDefs = [
    { cat: "陪伴交流", name: "陪伴2小时", price: 8000, min: 120, outdoor: false },
    { cat: "陪伴交流", name: "陪伴4小时", price: 15000, min: 240, outdoor: false },
    { cat: "生活协助", name: "生活协助2小时", price: 9000, min: 120, outdoor: false },
    { cat: "文娱活动", name: "文娱小组场次", price: 6000, min: 90, outdoor: false },
    { cat: "外出陪同", name: "外出陪同3小时", price: 12000, min: 180, outdoor: true },
    { cat: "代办跑腿", name: "代购1小时", price: 5000, min: 60, outdoor: false },
  ];
  const skus = {};
  skuDefs.forEach((s) => {
    const rec = findOrCreateBase(
      "service_items",
      'name = {:n}',
      { n: s.name },
      (r) => {
        r.set("category", cats[s.cat].id);
        r.set("name", s.name);
        r.set("price_cents", s.price);
        r.set("duration_minutes", s.min);
        r.set("requires_outdoor_approval", s.outdoor);
        r.set("enabled", true);
      }
    );
    skus[s.name] = rec;
  });

  // —— 院校合作 ——
  ["ORG001", "ORG002", "ORG003"].forEach((code) => {
    findOrCreateBase(
      "school_cooperation",
      'school = {:sid} && org = {:oid}',
      { sid: schools["示范大学"].id, oid: orgs[code].id },
      (r) => {
        r.set("school", schools["示范大学"].id);
        r.set("org", orgs[code].id);
        r.set("enabled", true);
      }
    );
  });

  // —— 老人 ——
  const elderDefs = [
    { org: "ORG001", com: "A区", name: "张奶奶", lat: 31.2305, lng: 121.474 },
    { org: "ORG001", com: "B区", name: "李爷爷", lat: 31.231, lng: 121.475 },
    { org: "ORG002", com: "康乐花园", name: "王阿姨", lat: 31.2352, lng: 121.4805 },
    { org: "ORG002", com: "康乐花园", name: "赵伯伯", lat: 31.2348, lng: 121.4798 },
    { org: "ORG003", com: "夕阳楼", name: "陈奶奶", lat: 31.2282, lng: 121.4685 },
    { org: "ORG003", com: "夕阳楼", name: "刘爷爷", lat: 31.2278, lng: 121.469 },
  ];
  const elders = {};
  elderDefs.forEach((el) => {
    const comKey = el.org + "_" + el.com;
    const rec = findOrCreateBase(
      "elders",
      'name = {:n} && org = {:oid}',
      { n: el.name, oid: orgs[el.org].id },
      (r) => {
        r.set("org", orgs[el.org].id);
        if (communities[comKey]) r.set("community", communities[comKey].id);
        r.set("name", el.name);
        r.set("latitude", el.lat);
        r.set("longitude", el.lng);
        r.set("enabled", true);
      }
    );
    elders[el.name] = rec;
    stats.elders++;
  });

  // 指定老人（示范大学项目）
  findOrCreateBase(
    "school_designated_elder",
    'elder = {:eid}',
    { eid: elders["张奶奶"].id },
    (r) => {
      r.set("school", schools["示范大学"].id);
      r.set("org", orgs["ORG001"].id);
      r.set("elder", elders["张奶奶"].id);
      r.set("enabled", true);
    }
  );
  findOrCreateBase(
    "school_designated_elder",
    'elder = {:eid}',
    { eid: elders["李爷爷"].id },
    (r) => {
      r.set("school", schools["示范大学"].id);
      r.set("org", orgs["ORG001"].id);
      r.set("elder", elders["李爷爷"].id);
      r.set("enabled", true);
    }
  );

  // —— 用户 & 角色 ——
  const elderUsers = [
    { email: "elder1@test.nuanban.dev", name: "张奶奶账号", elder: "张奶奶" },
    { email: "elder2@test.nuanban.dev", name: "李爷爷账号", elder: "李爷爷" },
  ];
  elderUsers.forEach((eu) => {
    const u = findOrCreateUser(eu.email, eu.name);
    findOrCreateUserRole(u.id, "elder", {
      elder_profile: elders[eu.elder].id,
    });
  });

  const familyUsers = [
    { email: "family1@test.nuanban.dev", name: "张女士", elder: "张奶奶", primary: true },
    { email: "family2@test.nuanban.dev", name: "李先生", elder: "李爷爷", primary: true },
    { email: "family3@test.nuanban.dev", name: "王小明", elder: "王阿姨", primary: true },
  ];
  familyUsers.forEach((fu) => {
    const u = findOrCreateUser(fu.email, fu.name);
    findOrCreateUserRole(u.id, "family", {});
    const existing = $app.findRecordsByFilter(
      "family_elder_bindings",
      'family_user = {:f} && elder = {:e}',
      "",
      1,
      0,
      { f: u.id, e: elders[fu.elder].id }
    );
    if (!existing.length) {
      const col = $app.findCollectionByNameOrId("family_elder_bindings");
      const b = new Record(col);
      b.set("family_user", u.id);
      b.set("elder", elders[fu.elder].id);
      b.set("relation_label", "子女");
      b.set("is_primary_payer", fu.primary);
      $app.save(b);
    }
  });

  const studentDefs = [
    { email: "student1@test.nuanban.dev", name: "小李", school: "示范大学", lat: 31.231, lng: 121.474, dn: "小李同学" },
    { email: "student2@test.nuanban.dev", name: "小王", school: "示范大学", lat: 31.232, lng: 121.476, dn: "小王同学" },
    { email: "student3@test.nuanban.dev", name: "小张", school: "城东职业学院", lat: 31.236, lng: 121.481, dn: "小张同学" },
    { email: "student4@test.nuanban.dev", name: "小陈", school: "示范大学", lat: 31.229, lng: 121.472, dn: "小陈同学" },
    { email: "student5@test.nuanban.dev", name: "小刘", school: "阳光师范学院", lat: 31.234, lng: 121.478, dn: "小刘同学" },
    { email: "student@test.nuanban.dev", name: "测试学生", school: "示范大学", lat: 31.2315, lng: 121.4745, dn: "测试学生" },
  ];
  const students = {};
  studentDefs.forEach((st) => {
    const u = findOrCreateUser(st.email, st.name);
    findOrCreateUserRole(u.id, "student", {
      school: schools[st.school].id,
      display_name: st.dn,
      latitude: st.lat,
      longitude: st.lng,
      org: orgs["ORG001"].id,
    });
    students[st.email] = u;
    stats.students++;
  });

  // 兼容旧账号名
  const legacyElder = findOrCreateUser("elder@test.nuanban.dev", "老人测试");
  findOrCreateUserRole(legacyElder.id, "elder", { elder_profile: elders["张奶奶"].id });
  const legacyFamily = findOrCreateUser("family@test.nuanban.dev", "家属测试");
  findOrCreateUserRole(legacyFamily.id, "family", {});

  // —— 订单样例 ——
  const now = new Date();
  const iso = (d) => d.toISOString();
  const orderDefs = [
    {
      elder: "张奶奶",
      sku: "陪伴2小时",
      student: "student1@test.nuanban.dev",
      source: "elder_self",
      status: "pending_accept",
      payment: "paid",
      family: "family1@test.nuanban.dev",
      creator: "elder1@test.nuanban.dev",
    },
    {
      elder: "王阿姨",
      sku: "生活协助2小时",
      student: "student2@test.nuanban.dev",
      source: "elder_self",
      status: "pending_service",
      payment: "paid",
      family: "family3@test.nuanban.dev",
      creator: "elder2@test.nuanban.dev",
    },
    {
      elder: "李爷爷",
      sku: "外出陪同3小时",
      student: "student3@test.nuanban.dev",
      source: "family",
      status: "outdoor_pending",
      payment: "paid",
      family: "family2@test.nuanban.dev",
      creator: "family2@test.nuanban.dev",
    },
    {
      elder: "陈奶奶",
      sku: "陪伴2小时",
      student: "student4@test.nuanban.dev",
      source: "admin_assign",
      status: "completed",
      payment: "paid",
      family: "family3@test.nuanban.dev",
      creator: "family3@test.nuanban.dev",
    },
    {
      elder: "赵伯伯",
      sku: "代购1小时",
      student: null,
      source: "elder_self",
      status: "pending_payment",
      payment: "unpaid",
      family: "family3@test.nuanban.dev",
      creator: "elder2@test.nuanban.dev",
    },
  ];

  orderDefs.forEach((od, idx) => {
    const elderRec = elders[od.elder];
    const skuRec = skus[od.sku];
    const filter =
      'elder = {:eid} && service_item = {:sid} && status = {:st}';
    let ord = findOne("orders", filter, {
      eid: elderRec.id,
      sid: skuRec.id,
      st: od.status,
    });
    if (!ord) {
      const col = $app.findCollectionByNameOrId("orders");
      ord = new Record(col);
      ord.set("elder", elderRec.id);
      ord.set("service_item", skuRec.id);
      ord.set("source", od.source);
      ord.set("status", od.status);
      ord.set("payment_status", od.payment);
      ord.set("amount_cents", skuRec.getInt("price_cents"));
      const t = new Date(now.getTime() + (idx + 1) * 3600000);
      ord.set("scheduled_at", iso(t));
      if (od.student && students[od.student]) ord.set("student_user", students[od.student].id);
      if (od.family) {
        const fu = findOrCreateUser(od.family, od.family);
        ord.set("family_user", fu.id);
      }
      if (od.creator) {
        const cu = findOrCreateUser(od.creator, od.creator);
        ord.set("created_by", cu.id);
      }
      if (od.payment === "paid") ord.set("paid_at", iso(now));
      $app.save(ord);
      stats.orders++;

      if (od.status === "outdoor_pending") {
        const out = findOne("outdoor_approvals", 'order = {:oid}', { oid: ord.id });
        if (!out) {
          const ocol = $app.findCollectionByNameOrId("outdoor_approvals");
          const orec = new Record(ocol);
          orec.set("order", ord.id);
          orec.set("status", "pending_family");
          $app.save(orec);
        }
      }

      if (od.status === "pending_service" || od.status === "completed") {
        const sch = findOne("schedules", 'order = {:oid}', { oid: ord.id });
        if (!sch && od.student && students[od.student]) {
          const scol = $app.findCollectionByNameOrId("schedules");
          const srec = new Record(scol);
          srec.set("order", ord.id);
          srec.set("elder", elderRec.id);
          srec.set("student_user", students[od.student].id);
          srec.set("status", od.status === "completed" ? "completed" : "pending_service");
          srec.set("scheduled_start", ord.getString("scheduled_at"));
          $app.save(srec);
        }
      }

      if (od.status === "completed" && od.student && students[od.student]) {
        const sett = findOne("settlements", 'order = {:oid}', { oid: ord.id });
        if (!sett) {
          const scol = $app.findCollectionByNameOrId("settlements");
          const srec = new Record(scol);
          srec.set("order", ord.id);
          srec.set("student_user", students[od.student].id);
          srec.set("amount_cents", Math.floor(skuRec.getInt("price_cents") * 0.7));
          srec.set("status", "paid");
          $app.save(srec);
        }
      }
    }
  });

  // 导出任务样例
  findOrCreateBase(
    "export_tasks",
    'export_type = {:t} && status = {:s}',
    { t: "orders", s: "done" },
    (r) => {
      r.set("export_type", "orders");
      r.set("status", "done");
    }
  );

  return e.json(200, {
    ok: true,
    message: "演示数据已写入（可重复执行）",
    stats,
    accounts: {
      password: DEV_PASS,
      elder: ["elder1@test.nuanban.dev", "elder@test.nuanban.dev"],
      family: ["family1@test.nuanban.dev", "family@test.nuanban.dev"],
      student: ["student1@test.nuanban.dev", "student@test.nuanban.dev"],
    },
  });
});
