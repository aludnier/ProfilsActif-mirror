
SET NAMES utf8mb4;

DELETE FROM questionnaire_attempt;
DELETE FROM questionnaire_version;
DELETE FROM questionnaire;

DELETE FROM app_user
WHERE uuid LIKE '20000000-0000-4000-8000-%'
   OR uuid LIKE '30000000-0000-4000-8000-%'
   OR mail = 'rachid@rekrut.fr';

-- Candidat de test — identifiants : candidat@test.fr / candidat123

INSERT INTO app_user (uuid, first_name, last_name, mail, phone, password_hash, role, status)
VALUES (
  '20000000-0000-4000-8000-000000000001',
  'Camille', 'Test', 'candidat@test.fr', NULL,
  '$2a$10$F7JeiV0h0766Ctqg2lSN8ux.5d7U.HQuvXueaK4zfN3t4mQxyZ3tG',
  'seeker', 'active'
);

INSERT INTO seeker (id, location, target_sector)
VALUES ('20000000-0000-4000-8000-000000000001', 'Paris', 'Développement web');


-- Recruteurs de test. Mot de passe commun : recruteur123

INSERT INTO app_user (uuid, first_name, last_name, mail, phone, password_hash, role, status) VALUES
  ('30000000-0000-4000-8000-000000000001', 'Rachid', 'Rekrut',   'rachid.rekrut@rekrut.fr',                 '0600000001', '$2a$10$OYzLcWDC/Qxy/kYHqjZaVOeyqUUZe6q4Ecmb8XXFOkRtFUlDckohC', 'recruiter', 'active'),
  ('30000000-0000-4000-8000-000000000002', 'Sophie', 'Bernard',  'sophie.bernard@dgfip.finances.gouv.fr',   '0600000002', '$2a$10$OYzLcWDC/Qxy/kYHqjZaVOeyqUUZe6q4Ecmb8XXFOkRtFUlDckohC', 'recruiter', 'active'),
  ('30000000-0000-4000-8000-000000000003', 'Karim',  'Toumi',    'k.toumi@atos.net',                        '0600000003', '$2a$10$OYzLcWDC/Qxy/kYHqjZaVOeyqUUZe6q4Ecmb8XXFOkRtFUlDckohC', 'recruiter', 'active'),
  ('30000000-0000-4000-8000-000000000004', 'Élise',  'Fontaine', 'recrutement@mairie-lyon.fr',              '0600000004', '$2a$10$OYzLcWDC/Qxy/kYHqjZaVOeyqUUZe6q4Ecmb8XXFOkRtFUlDckohC', 'recruiter', 'active'),
  ('30000000-0000-4000-8000-000000000005', 'Marc',   'Dubois',   'm.dubois@capgemini.com',                  '0600000005', '$2a$10$OYzLcWDC/Qxy/kYHqjZaVOeyqUUZe6q4Ecmb8XXFOkRtFUlDckohC', 'recruiter', 'active');

INSERT INTO recruiter (id) VALUES
  ('30000000-0000-4000-8000-000000000001'),
  ('30000000-0000-4000-8000-000000000002'),
  ('30000000-0000-4000-8000-000000000003'),
  ('30000000-0000-4000-8000-000000000004'),
  ('30000000-0000-4000-8000-000000000005');

INSERT INTO contact (id, recruiter_id, seeker_id, message, created_at) VALUES
  (UUID(), '30000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001',
   'Bonjour Camille, la DGFiP recrute un développeur web pour son pôle numérique. Votre profil correspond, seriez-vous disponible pour un premier échange ?', NOW() - INTERVAL 6 DAY),
  (UUID(), '30000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000001',
   'Bonjour, nous avons une mission longue en développement front chez un client public. Votre vidéo de présentation nous a convaincus.', NOW() - INTERVAL 2 DAY),
  (UUID(), '30000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000001',
   'La Ville de Lyon ouvre un poste en alternance sur ses services en ligne. Intéressé(e) ?', NOW() - INTERVAL 1 DAY),
  (UUID(), '30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001',
   'Poste de développeur Vue.js à pourvoir rapidement, télétravail partiel possible.', NOW());

INSERT INTO questionnaire (id, code, title, created_by) VALUES
  ('10000000-0000-4000-8000-000000000001',
   'aptitudes-pro-v1',
   'Certification Aptitudes professionnelles',
   NULL);

INSERT INTO questionnaire_version
  (id, questionnaire_id, version, status, content, created_by, published_at)
VALUES (
  '10000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000001',
  1,
  'published',
  '{
    "config": {
      "passThreshold": 70,
      "minCategoryScore": 50,
      "retakeDelayDays": 14,
      "badgeBands": [
        { "min": 90, "level": "senior" },
        { "min": 80, "level": "intermédiaire" },
        { "min": 70, "level": "débutant" }
      ]
    },
    "categories": [
      { "code": "COMM", "label": "Communication professionnelle", "weight": 50 },
      { "code": "NUM", "label": "Compétences numériques de base", "weight": 50 }
    ],
    "questions": [
      {
        "id": "COMM-01", "category": "COMM", "weight": 1, "type": "single",
        "prompt": "Un collègue vous envoie un message que vous ne comprenez pas bien. Que faites-vous ?",
        "options": [
          { "id": "a", "label": "Vous répondez au mieux en devinant ce qu''il veut dire.", "points": 0 },
          { "id": "b", "label": "Vous reformulez ce que vous avez compris et demandez confirmation.", "points": 1 },
          { "id": "c", "label": "Vous ignorez le message en attendant qu''il précise.", "points": 0 }
        ]
      },
      {
        "id": "COMM-02", "category": "COMM", "weight": 1, "type": "single",
        "prompt": "Vous écrivez un email à une personne que vous ne connaissez pas. Quelle formule d''ouverture est la plus adaptée ?",
        "options": [
          { "id": "a", "label": "« Salut, »", "points": 0 },
          { "id": "b", "label": "« Bonjour Madame, Monsieur, »", "points": 1 },
          { "id": "c", "label": "« Coucou, »", "points": 0 }
        ]
      },
      {
        "id": "NUM-01", "category": "NUM", "weight": 1, "type": "single",
        "prompt": "Vous recevez un email vous demandant votre mot de passe pour « vérifier votre compte ». Que faites-vous ?",
        "options": [
          { "id": "a", "label": "Vous envoyez le mot de passe si l''expéditeur semble être votre entreprise.", "points": 0 },
          { "id": "b", "label": "Vous ne répondez pas et signalez l''email comme hameçonnage.", "points": 1 },
          { "id": "c", "label": "Vous cliquez sur le lien pour voir de quoi il s''agit.", "points": 0 }
        ]
      },
      {
        "id": "NUM-02", "category": "NUM", "weight": 1, "type": "multiple",
        "prompt": "Qu''est-ce qu''un bon mot de passe professionnel ? (plusieurs réponses)",
        "options": [
          { "id": "a", "label": "Long et unique pour chaque service.", "points": 1 },
          { "id": "b", "label": "Stocké dans un gestionnaire de mots de passe.", "points": 1 },
          { "id": "c", "label": "Le même partout pour ne pas l''oublier.", "points": 0 },
          { "id": "d", "label": "Sans information personnelle, par exemple pas votre date de naissance.", "points": 1 }
        ]
      }
    ]
  }',
  NULL,
  NOW()
);
