ALTER TABLE courses
    ADD COLUMN short_description text,
    ADD COLUMN modality varchar(40),
    ADD COLUMN duration_label varchar(80),
    ADD COLUMN schedule_summary text,
    ADD COLUMN investment_amount numeric(12,2),
    ADD COLUMN investment_currency varchar(10),
    ADD COLUMN certificate_included boolean NOT NULL DEFAULT false,
    ADD COLUMN contact_phone varchar(50),
    ADD COLUMN learning_outcomes text,
    ADD COLUMN featured boolean NOT NULL DEFAULT false;

ALTER TABLE courses
    ADD CONSTRAINT ck_courses_investment_non_negative
    CHECK (investment_amount IS NULL OR investment_amount >= 0);

ALTER TABLE course_sessions
    ADD COLUMN label varchar(160);

INSERT INTO courses (
    id, organization_id, name, slug, description, active,
    short_description, modality, duration_label, schedule_summary,
    investment_amount, investment_currency, certificate_included,
    contact_phone, learning_outcomes, featured
)
SELECT
    gen_random_uuid(), o.id,
    'Oratória e Comunicação Eficaz',
    'oratoria-comunicacao-eficaz',
    'Formação presencial orientada ao desenvolvimento da comunicação, da expressão verbal, da presença e da confiança ao falar em público.',
    true,
    'Desenvolva uma comunicação mais clara, assertiva e confiante.',
    'PRESENCIAL',
    '1 mês',
    'Terças e quintas-feiras, 17h–19h · Sábados, 09h–13h',
    1200.00,
    'MZN',
    true,
    '878 665 180',
    E'Comunicação eficaz e assertiva\nTécnicas de oratória e expressão verbal\nLinguagem corporal e presença\nOrganização e estrutura de discursos\nComo falar em público com confiança',
    true
FROM organizations o
WHERE o.slug = 'castros-services'
  AND NOT EXISTS (
      SELECT 1 FROM courses c
      WHERE c.organization_id = o.id
        AND c.slug = 'oratoria-comunicacao-eficaz'
  );

UPDATE courses
SET short_description = COALESCE(short_description, 'Desenvolva uma comunicação mais clara, assertiva e confiante.'),
    modality = COALESCE(modality, 'PRESENCIAL'),
    duration_label = COALESCE(duration_label, '1 mês'),
    schedule_summary = COALESCE(schedule_summary, 'Terças e quintas-feiras, 17h–19h · Sábados, 09h–13h'),
    investment_amount = COALESCE(investment_amount, 1200.00),
    investment_currency = COALESCE(investment_currency, 'MZN'),
    certificate_included = true,
    contact_phone = COALESCE(contact_phone, '878 665 180'),
    learning_outcomes = COALESCE(learning_outcomes, E'Comunicação eficaz e assertiva\nTécnicas de oratória e expressão verbal\nLinguagem corporal e presença\nOrganização e estrutura de discursos\nComo falar em público com confiança'),
    featured = true
WHERE slug = 'oratoria-comunicacao-eficaz';

INSERT INTO course_sessions (id, course_id, start_at, end_at, active, label)
SELECT
    gen_random_uuid(), c.id,
    timestamptz '2026-10-12 00:00:00+02',
    timestamptz '2026-11-12 00:00:00+02',
    true,
    'Edição com início a 12 de Outubro de 2026'
FROM courses c
JOIN organizations o ON o.id = c.organization_id
WHERE o.slug = 'castros-services'
  AND c.slug = 'oratoria-comunicacao-eficaz'
  AND NOT EXISTS (
      SELECT 1 FROM course_sessions cs
      WHERE cs.course_id = c.id
        AND cs.start_at = timestamptz '2026-10-12 00:00:00+02'
  );
