-- Reference list of IPC sections with severity flag.
-- Serious sections per ADR / Supreme Court criteria (murder, rape, etc.).

INSERT INTO ipc_sections (section, title, is_serious) VALUES
    ('302',  'Murder',                                 true),
    ('307',  'Attempt to Murder',                      true),
    ('376',  'Rape',                                   true),
    ('354',  'Assault or Criminal Force on Woman',     true),
    ('363',  'Kidnapping',                             true),
    ('420',  'Cheating and Dishonestly Inducing',      true),
    ('498A', 'Cruelty by Husband or Relatives',        true),
    ('395',  'Dacoity',                                true),
    ('153A', 'Promoting Enmity Between Groups',        true),
    ('124A', 'Sedition',                               true),
    ('201',  'Causing Disappearance of Evidence',      false),
    ('323',  'Voluntarily Causing Hurt',               false),
    ('341',  'Wrongful Restraint',                     false),
    ('506',  'Criminal Intimidation',                  false),
    ('147',  'Rioting',                                false),
    ('148',  'Rioting, Armed with Deadly Weapon',      false),
    ('149',  'Unlawful Assembly',                      false),
    ('188',  'Disobedience to Public Servant Order',   false),
    ('504',  'Intentional Insult to Provoke Breach',   false),
    ('427',  'Mischief Causing Damage',                false)
ON CONFLICT (section) DO UPDATE
    SET title      = EXCLUDED.title,
        is_serious = EXCLUDED.is_serious;
