
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM questionnaire_attempt;
DELETE FROM questionnaire_version;
DELETE FROM questionnaire;
DELETE FROM app_user WHERE mail = 'candidat@test.fr';
SET FOREIGN_KEY_CHECKS = 1;


INSERT INTO app_user (uuid, first_name, last_name, mail, phone, password_hash, role, status)
VALUES (
  '20000000-0000-4000-8000-000000000001',
  'Camille', 'Test', 'candidat@test.fr', NULL,
  '$2a$10$F7JeiV0h0766Ctqg2lSN8ux.5d7U.HQuvXueaK4zfN3t4mQxyZ3tG',
  'seeker', 'active'
);

INSERT INTO seeker (id, location, target_sector)
VALUES ('20000000-0000-4000-8000-000000000001', 'Paris', 'Développement web');

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
        { "min": 90, "level": "or" },
        { "min": 80, "level": "argent" },
        { "min": 70, "level": "bronze" }
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
