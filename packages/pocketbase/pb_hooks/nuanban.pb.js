/// V1 custom routes: wx-login stub, order accept/reject, family pay, outdoor approve

const DEV_PASSWORD = "nuanban_dev_2025";

function jsonOk(e, data) {
  return e.json(200, data);
}

function jsonErr(e, status, message) {
  return e.json(status, { message });
}

function requireAuth(e) {
  const auth = e.auth;
  if (!auth) {
    throw new UnauthorizedError("需要登录");
  }
  return auth;
}

function loadRoles(userId) {
  const records = $app.findRecordsByFilter(
    "user_roles",
    'user = {:uid}',
    "-created",
    50,
    0,
    { uid: userId }
  );
  return records.map((r) => ({
    role: r.getString("role"),
    status: r.getString("status"),
    elderProfileId: r.getString("elder_profile") || null,
  }));
}

function findOrCreateWxUser(code) {
  const safe = (code || "dev").replace(/[^a-zA-Z0-9]/g, "").slice(0, 16) || "dev";
  const email = `wx_${safe}@nuanban.dev`;
  let user;
  try {
    user = $app.findAuthRecordByEmail("users", email);
  } catch (_) {
    const col = $app.findCollectionByNameOrId("users");
    user = new Record(col);
    user.set("email", email);
    user.set("password", DEV_PASSWORD);
    user.set("passwordConfirm", DEV_PASSWORD);
    user.set("verified", true);
    user.set("name", `用户${safe.slice(0, 4)}`);
    $app.save(user);
  }
  return user;
}

routerAdd("POST", "/api/nuanban/wx-login", (e) => {
  const body = $apis.requestInfo(e).data || {};
  const code = body.code || "dev";
  const user = findOrCreateWxUser(code);
  const roles = loadRoles(user.id);
  const active =
    roles.find((r) => r.status === "active")?.role || roles[0]?.role || null;
  return jsonOk(e, {
    token: user.newAuthToken(),
    user: { id: user.id, nickname: user.getString("name") || user.email() },
    roles,
    activeRole: active,
  });
});

/** 本地 H5 开发登录：不校验密码，仅按邮箱发 token（须先 seed-demo） */
routerAdd("POST", "/api/nuanban/dev-login", (e) => {
  const body = $apis.requestInfo(e).data || {};
  const email = (body.email || "student1@test.nuanban.dev").trim();
  let user;
  try {
    user = $app.findAuthRecordByEmail("users", email);
  } catch (_) {
    return jsonErr(
      e,
      404,
      "用户不存在，请先在终端执行: ./scripts/seed-demo.sh"
    );
  }
  const roles = loadRoles(user.id);
  if (!roles.length) {
    return jsonErr(e, 400, "该账号无角色，请在 Admin 添加 user_roles 或重新 seed");
  }
  const active =
    roles.find((r) => r.status === "active")?.role || roles[0]?.role || null;
  return jsonOk(e, {
    token: user.newAuthToken(),
    user: { id: user.id, nickname: user.getString("name") || email },
    roles,
    activeRole: active,
  });
});

routerAdd("GET", "/api/nuanban/auth/me", (e) => {
  const auth = requireAuth(e);
  return jsonOk(e, {
    user: { id: auth.id, nickname: auth.getString("name") },
    roles: loadRoles(auth.id),
  });
});

routerAdd("POST", "/api/nuanban/auth/register", (e) => {
  const auth = requireAuth(e);
  const body = $apis.requestInfo(e).data || {};
  const role = body.role || "student";
  const existing = $app.findRecordsByFilter(
    "user_roles",
    'user = {:uid} && role = {:role}',
    "",
    1,
    0,
    { uid: auth.id, role }
  );
  if (existing.length > 0) {
    return jsonOk(e, { ok: true, roles: loadRoles(auth.id) });
  }
  const col = $app.findCollectionByNameOrId("user_roles");
  const rec = new Record(col);
  rec.set("user", auth.id);
  rec.set("role", role);
  rec.set("status", role === "student" ? "pending" : "active");
  if (body.displayName) rec.set("display_name", body.displayName);
  $app.save(rec);
  return jsonOk(e, { ok: true, roles: loadRoles(auth.id) });
});

routerAdd("GET", "/api/nuanban/elder/caregivers/nearby", (e) => {
  requireAuth(e);
  const q = e.request.url.query();
  const lat = parseFloat(q.get("lat") || "0");
  const lng = parseFloat(q.get("lng") || "0");
  const radiusKm = parseFloat(q.get("radiusKm") || "5");

  const students = $app.findRecordsByFilter(
    "user_roles",
    'role = "student" && status = "active"',
    "-created",
    100,
    0
  );

  const list = [];
  students.forEach((r) => {
    const slat = r.getFloat("latitude");
    const slng = r.getFloat("longitude");
    let distanceKm = 999;
    if (lat && lng && slat && slng) {
      const R = 6371;
      const dLat = ((slat - lat) * Math.PI) / 180;
      const dLng = ((slng - lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat * Math.PI) / 180) *
          Math.cos((slat * Math.PI) / 180) *
          Math.sin(dLng / 2) ** 2;
      distanceKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
    if (distanceKm <= radiusKm) {
      const schoolId = r.getString("school");
      let schoolName = "";
      if (schoolId) {
        try {
          const s = $app.findRecordById("school_dict", schoolId);
          schoolName = s.getString("name");
        } catch (_) {}
      }
      list.push({
        id: r.id,
        userId: r.getString("user"),
        name: r.getString("display_name") || "同学",
        school: schoolName || "高校志愿者",
        distanceKm: Math.round(distanceKm * 10) / 10,
        distance:
          distanceKm < 1
            ? `${Math.round(distanceKm * 1000)}m`
            : `${distanceKm.toFixed(1)}km`,
      });
    }
  });
  list.sort((a, b) => a.distanceKm - b.distanceKm);
  return jsonOk(e, { list });
});

routerAdd("POST", "/api/nuanban/elder/orders", (e) => {
  const auth = requireAuth(e);
  const body = $apis.requestInfo(e).data || {};
  const elderId = body.elderId;
  const serviceItemId = body.serviceItemId;
  if (!elderId || !serviceItemId) {
    return jsonErr(e, 400, "缺少 elderId 或 serviceItemId");
  }

  let item;
  try {
    item = $app.findRecordById("service_items", serviceItemId);
  } catch (_) {
    return jsonErr(e, 404, "服务项不存在");
  }

  const needsOutdoor = item.getBool("requires_outdoor_approval");
  const amount = item.getInt("price_cents");
  let status = "pending_accept";
  let paymentStatus = "paid";
  if (body.requirePayment) {
    status = "pending_payment";
    paymentStatus = "unpaid";
  }

  const ordersCol = $app.findCollectionByNameOrId("orders");
  const order = new Record(ordersCol);
  order.set("elder", elderId);
  order.set("service_item", serviceItemId);
  order.set("source", "elder_self");
  order.set("status", status);
  order.set("payment_status", paymentStatus);
  order.set("amount_cents", amount);
  order.set("created_by", auth.id);
  if (body.studentId) order.set("student_user", body.studentId);
  if (body.scheduledAt) order.set("scheduled_at", body.scheduledAt);
  $app.save(order);

  if (needsOutdoor && status !== "pending_payment") {
    order.set("status", "outdoor_pending");
    $app.save(order);
    const outCol = $app.findCollectionByNameOrId("outdoor_approvals");
    const out = new Record(outCol);
    out.set("order", order.id);
    out.set("status", "pending_family");
    $app.save(out);
  }

  return jsonOk(e, { id: order.id, status: order.getString("status") });
});

routerAdd("POST", "/api/nuanban/student/order-requests/{id}/accept", (e) => {
  const auth = requireAuth(e);
  const orderId = e.request.pathValue("id");
  let order;
  try {
    order = $app.findRecordById("orders", orderId);
  } catch (_) {
    return jsonErr(e, 404, "订单不存在");
  }
  if (order.getString("status") !== "pending_accept") {
    return jsonErr(e, 400, "订单状态不可接单");
  }

  let item;
  try {
    item = $app.findRecordById("service_items", order.getString("service_item"));
  } catch (_) {
    item = null;
  }
  const needsOutdoor = item && item.getBool("requires_outdoor_approval");

  order.set("student_user", auth.id);
  if (needsOutdoor) {
    order.set("status", "outdoor_pending");
    $app.save(order);
    const existing = $app.findRecordsByFilter(
      "outdoor_approvals",
      'order = {:oid}',
      "",
      1,
      0,
      { oid: orderId }
    );
    if (existing.length === 0) {
      const outCol = $app.findCollectionByNameOrId("outdoor_approvals");
      const out = new Record(outCol);
      out.set("order", orderId);
      out.set("status", "pending_family");
      $app.save(out);
    }
  } else {
    order.set("status", "pending_service");
    $app.save(order);
    const schCol = $app.findCollectionByNameOrId("schedules");
    const sch = new Record(schCol);
    sch.set("order", orderId);
    sch.set("elder", order.getString("elder"));
    sch.set("student_user", auth.id);
    sch.set("status", "pending_service");
    sch.set("scheduled_start", order.getString("scheduled_at"));
    $app.save(sch);
  }

  return jsonOk(e, { ok: true, status: order.getString("status") });
});

routerAdd("POST", "/api/nuanban/student/order-requests/{id}/reject", (e) => {
  requireAuth(e);
  const orderId = e.request.pathValue("id");
  const body = $apis.requestInfo(e).data || {};
  let order;
  try {
    order = $app.findRecordById("orders", orderId);
  } catch (_) {
    return jsonErr(e, 404, "订单不存在");
  }
  order.set("student_user", "");
  order.set("reject_reason", body.reason || "学生拒绝");
  order.set("status", "pending_accept");
  $app.save(order);
  return jsonOk(e, { ok: true });
});

routerAdd("POST", "/api/nuanban/family/orders/{id}/pay", (e) => {
  requireAuth(e);
  const orderId = e.request.pathValue("id");
  let order;
  try {
    order = $app.findRecordById("orders", orderId);
  } catch (_) {
    return jsonErr(e, 404, "订单不存在");
  }
  if (order.getString("status") !== "pending_payment") {
    return jsonErr(e, 400, "订单无需支付");
  }
  order.set("payment_status", "paid");
  order.set("paid_at", new Date().toISOString());
  order.set("status", "pending_accept");
  $app.save(order);

  let item;
  try {
    item = $app.findRecordById("service_items", order.getString("service_item"));
  } catch (_) {
    item = null;
  }
  if (item && item.getBool("requires_outdoor_approval")) {
    order.set("status", "outdoor_pending");
    $app.save(order);
    const outCol = $app.findCollectionByNameOrId("outdoor_approvals");
    const out = new Record(outCol);
    out.set("order", orderId);
    out.set("status", "pending_family");
    $app.save(out);
  }

  return jsonOk(e, { ok: true, status: order.getString("status") });
});

routerAdd("POST", "/api/nuanban/family/outdoor/{id}/approve", (e) => {
  const auth = requireAuth(e);
  const orderId = e.request.pathValue("id");
  const body = $apis.requestInfo(e).data || {};
  const approved = !!body.approved;

  const outs = $app.findRecordsByFilter(
    "outdoor_approvals",
    'order = {:oid}',
    "",
    1,
    0,
    { oid: orderId }
  );
  if (outs.length === 0) {
    return jsonErr(e, 404, "外出审批不存在");
  }
  const out = outs[0];
  let order;
  try {
    order = $app.findRecordById("orders", orderId);
  } catch (_) {
    return jsonErr(e, 404, "订单不存在");
  }

  if (approved) {
    out.set("status", "approved");
    out.set("family_user", auth.id);
    $app.save(out);
    order.set("status", "pending_service");
    $app.save(order);
    const schCol = $app.findCollectionByNameOrId("schedules");
    const existing = $app.findRecordsByFilter(
      "schedules",
      'order = {:oid}',
      "",
      1,
      0,
      { oid: orderId }
    );
    if (existing.length === 0 && order.getString("student_user")) {
      const sch = new Record(schCol);
      sch.set("order", orderId);
      sch.set("elder", order.getString("elder"));
      sch.set("student_user", order.getString("student_user"));
      sch.set("status", "pending_service");
      sch.set("scheduled_start", order.getString("scheduled_at"));
      $app.save(sch);
    }
  } else {
    out.set("status", "rejected");
    out.set("rejected_reason", body.reason || "家属拒绝外出");
    out.set("family_user", auth.id);
    $app.save(out);
    order.set("status", "cancelled");
    $app.save(order);
  }

  return jsonOk(e, { ok: true, approved });
});

routerAdd("GET", "/api/nuanban/student/orders/pending", (e) => {
  requireAuth(e);
  const records = $app.findRecordsByFilter(
    "orders",
    'status = "pending_accept"',
    "-created",
    50,
    0
  );
  const list = records.map((o) => ({
    id: o.id,
    elderId: o.getString("elder"),
    amountCents: o.getInt("amount_cents"),
    scheduledAt: o.getString("scheduled_at"),
    status: o.getString("status"),
  }));
  return jsonOk(e, { list });
});
