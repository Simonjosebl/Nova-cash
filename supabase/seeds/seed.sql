-- Nova Cash · Seed de DESARROLLO (Cap. 5.19). NUNCA usar en producción (ADR-047).
-- Se ejecuta con `supabase db reset`. Crea un usuario y datos demo.
--   Usuario:    demo@novacash.co
--   Contraseña: demo1234

do $$
declare
  demo_user_id uuid := '00000000-0000-0000-0000-0000000000d1';
  demo_profile_id uuid;
  ws_id uuid;
  acc_bank uuid;
  acc_cash uuid;
  cat_food uuid;
  cat_transport uuid;
  cat_salary uuid;
begin
  if exists (select 1 from auth.users where id = demo_user_id) then
    return; -- ya sembrado
  end if;

  -- Usuario de autenticación (el trigger handle_new_user crea el profile).
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  )
  values (
    '00000000-0000-0000-0000-000000000000', demo_user_id, 'authenticated', 'authenticated',
    'demo@novacash.co', crypt('demo1234', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{"name":"Demo"}', now(), now()
  );

  insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (
    demo_user_id::text, demo_user_id,
    jsonb_build_object('sub', demo_user_id::text, 'email', 'demo@novacash.co'),
    'email', now(), now(), now()
  );

  select id into demo_profile_id from public.profiles where auth_user_id = demo_user_id;

  -- Workspace (los triggers agregan al owner como admin y crean settings).
  insert into public.workspaces (name, emoji, type, currency, owner_id, created_by)
  values ('Personal', '👤', 'personal', 'COP', demo_profile_id, demo_profile_id)
  returning id into ws_id;

  -- Cuentas
  insert into public.accounts (workspace_id, name, emoji, type, currency, opening_balance)
  values (ws_id, 'Bancolombia', '🏦', 'bank', 'COP', 3000000) returning id into acc_bank;
  insert into public.accounts (workspace_id, name, emoji, type, currency, opening_balance)
  values (ws_id, 'Efectivo', '💵', 'cash', 'COP', 200000) returning id into acc_cash;

  -- Categorías
  insert into public.categories (workspace_id, name, emoji, type)
  values (ws_id, 'Comida', '🍔', 'expense') returning id into cat_food;
  insert into public.categories (workspace_id, name, emoji, type)
  values (ws_id, 'Transporte', '🚗', 'expense') returning id into cat_transport;
  insert into public.categories (workspace_id, name, emoji, type)
  values (ws_id, 'Sueldo', '💼', 'income') returning id into cat_salary;

  -- Transacciones (disparan la cascada de saldos + auditoría)
  insert into public.transactions (workspace_id, account_id, category_id, type, amount, description, transaction_date)
  values
    (ws_id, acc_bank, cat_salary, 'income', 3500000, 'Nómina', current_date - 5),
    (ws_id, acc_bank, cat_food, 'expense', 45000, 'Almuerzo', current_date - 2),
    (ws_id, acc_cash, cat_transport, 'expense', 12000, 'Bus', current_date - 1);

  -- Presupuesto y meta demo
  insert into public.budgets (workspace_id, category_id, amount, currency, warning_percentage)
  values (ws_id, cat_food, 600000, 'COP', 80);

  insert into public.goals (workspace_id, name, emoji, target_amount, target_date)
  values (ws_id, 'Viaje a Japón', '✈️', 8000000, current_date + 365);

  -- Evento de calendario demo (próximo pago)
  insert into public.calendar_events (workspace_id, title, emoji, flow, amount, category_id, event_date)
  values (ws_id, 'Arriendo', '🏠', 'expense', 1200000, cat_food, current_date + 3);
end $$;
