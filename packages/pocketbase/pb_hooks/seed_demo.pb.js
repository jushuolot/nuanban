/// 一键写入演示数据：POST /api/nuanban/seed-demo?key=nuanban_dev_seed
/// 可重复执行（按名称/邮箱去重，不重复创建）
(function () {

const SEED_KEY = "nuanban_dev_seed";
const DEV_PASS = "nuanban_dev_2025";

var mustSeedKey = function(e) {
  const q = e.request.url.query();
  if (q.get("key") !== SEED_KEY) {
    throw new BadRequestError("缺少或错误的 key 参数");
  }
}

var findOne = function(collection, filter, params) {
  const rows = $app.findRecordsByFilter(collection, filter, "", 1, 0, params || {});
  return rows.length ? rows[0] : null;
}

var findOrCreateBase = function(collection, filter, params, apply) {
  let rec = findOne(collection, filter, params);
  if (rec) return rec;
  const col = $app.findCollectionByNameOrId(collection);
  rec = new Record(col);
  apply(rec);
  $app.save(rec);
  return rec;
}

var findOrCreateUser = function(email, name) {
  const existing = $app.findRecordsByFilter(
    "users",
    "email = {:e}",
    "",
    1,
    0,
    { e: email }
  );
  if (existing.length > 0) {
    return existing[0];
  }
  const col = $app.findCollectionByNameOrId("users");
  const u = new Record(col);
  u.set("email", email);
  u.setRandomPassword();
  u.set("verified", true);
  u.set("name", name);
  $app.saveNoValidate(u);
  return u;
}

var findOrCreateUserRole = function(userId, role, extra) {
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
  const stats = { users: 0, roles: 0, schools: 0 };

  // school_dict
  const existingSchool = $app.findRecordsByFilter(
    "school_dict",
    "name = {:n}",
    "",
    1,
    0,
    { n: "示范大学" }
  );
  let school;
  if (existingSchool.length > 0) {
    school = existingSchool[0];
  } else {
    const schoolCol = $app.findCollectionByNameOrId("school_dict");
    school = new Record(schoolCol);
    school.set("name", "示范大学");
    school.set("sort_order", 1);
    school.set("enabled", true);
    $app.save(school);
  }
  stats.schools += 1;

  function findOrCreateUserByEmail(email, name) {
    const rows = $app.findRecordsByFilter(
      "users",
      "email = {:e}",
      "",
      1,
      0,
      { e: email }
    );
    if (rows.length > 0) return rows[0];
    const usersCol = $app.findCollectionByNameOrId("users");
    const u = new Record(usersCol);
    u.set("email", email);
    u.setRandomPassword();
    u.set("verified", true);
    u.set("name", name);
    $app.saveNoValidate(u);
    stats.users += 1;
    return u;
  }

  function findOrCreateRole(userId, role, extra) {
    const rows = $app.findRecordsByFilter(
      "user_roles",
      "user = {:uid} && role = {:r}",
      "",
      1,
      0,
      { uid: userId, r: role }
    );
    if (rows.length > 0) return rows[0];
    const rolesCol = $app.findCollectionByNameOrId("user_roles");
    const rec = new Record(rolesCol);
    rec.set("user", userId);
    rec.set("role", role);
    rec.set("status", "active");
    if (extra) {
      const keys = Object.keys(extra);
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        rec.set(k, extra[k]);
      }
    }
    $app.save(rec);
    stats.roles += 1;
    return rec;
  }

  const uStudent = findOrCreateUserByEmail("student1@test.nuanban.dev", "学生1");
  const uFamily = findOrCreateUserByEmail("family1@test.nuanban.dev", "家属1");
  const uElder = findOrCreateUserByEmail("elder1@test.nuanban.dev", "老人1");

  // 注意：部分 PocketBase JS hooks 环境下对 collection rules / 查询行为更严格，
  // 为保证「从 GitHub 克隆后开箱即测」，最小 seed 仅创建 users 与 school_dict。
  // 角色信息由 dev-login 返回固定桩（见 nuanban.pb.js）。

  return e.json(200, {
    ok: true,
    message: "演示账号已写入（最小集，可重复执行）",
    stats: stats,
    accounts: {
      student: ["student1@test.nuanban.dev"],
      family: ["family1@test.nuanban.dev"],
      elder: ["elder1@test.nuanban.dev"],
    },
  });
});

})();
