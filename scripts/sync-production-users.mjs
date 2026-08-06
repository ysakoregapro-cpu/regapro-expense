import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !secretKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL または SUPABASE_SECRET_KEY が不足しています。",
  );
}

const supabase = createClient(supabaseUrl, secretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const targetUsers = [
  {
    displayName: "酒匂 裕介",
    loginId: "yusuke.s",
    email: "y.sako.regapro@gmail.com",
    role: "admin",
    password: process.env.REGAPRO_PASS_YUSUKE,
    legacyLoginIds: ["sakawa", "yusuke.s"],
  },
  {
    displayName: "内藤 雄至",
    loginId: "yushi.n",
    email: "regapro.2019.02@gmail.com",
    role: "admin",
    password: process.env.REGAPRO_PASS_YUSHI,
    legacyLoginIds: ["yushi.n"],
  },
  {
    displayName: "田中 和希",
    loginId: "kazuki.t",
    email: "k.tanaka.regapro@gmail.com",
    role: "applicant",
    password: process.env.REGAPRO_PASS_KAZUKI,
    legacyLoginIds: ["kazuki.t"],
  },
];

function assertPassword(value, loginId) {
  if (!value || value.length < 12) {
    throw new Error(
      `${loginId} の初期パスワードは12文字以上で設定してください。`,
    );
  }
}

async function findAuthUserByEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 100,
    });

    if (error) {
      throw error;
    }

    const user = data.users.find(
      (item) => item.email?.toLowerCase() === normalizedEmail,
    );

    if (user) {
      return user;
    }

    if (data.users.length < 100) {
      return null;
    }

    page += 1;
  }
}

async function findProfileByLoginIds(loginIds) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, login_id")
    .in("login_id", loginIds)
    .limit(1);

  if (error) {
    throw error;
  }

  return data?.[0] ?? null;
}

async function syncUser(target) {
  assertPassword(target.password, target.loginId);

  const existingProfile = await findProfileByLoginIds(
    target.legacyLoginIds,
  );

  let userId = existingProfile?.id ?? null;

  if (!userId) {
    const existingAuthUser = await findAuthUserByEmail(target.email);
    userId = existingAuthUser?.id ?? null;
  }

  if (userId) {
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      email: target.email,
      password: target.password,
      email_confirm: true,
      user_metadata: {
        login_id: target.loginId,
        display_name: target.displayName,
      },
    });

    if (error) {
      throw error;
    }

    console.log(`Auth更新: ${target.loginId}`);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: target.email,
      password: target.password,
      email_confirm: true,
      user_metadata: {
        login_id: target.loginId,
        display_name: target.displayName,
      },
    });

    if (error || !data.user) {
      throw error ?? new Error(`${target.loginId} の作成に失敗しました。`);
    }

    userId = data.user.id;
    console.log(`Auth作成: ${target.loginId}`);
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        login_id: target.loginId,
        display_name: target.displayName,
        role: target.role,
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "id",
      },
    );

  if (profileError) {
    throw profileError;
  }

  console.log(
    `Profile同期: ${target.displayName} / ${target.loginId} / ${target.role}`,
  );
}

async function main() {
  for (const target of targetUsers) {
    await syncUser(target);
  }

  console.log("3ユーザーの同期が完了しました。");
}

main().catch((error) => {
  console.error(
    "ユーザー同期に失敗しました:",
    error instanceof Error ? error.message : "不明なエラー",
  );

  process.exitCode = 1;
});