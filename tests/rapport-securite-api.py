#!/usr/bin/env python3
"""
ExpertERPHub — Rapport d'Audit Sécurité & Tests API
Génère un PDF professionnel avec les résultats
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.units import inch, mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.pdfgen import canvas
import datetime

# ── Config ──
OUTPUT = "/sessions/loving-happy-hopper/mnt/ExpertERPHUB/tests/ExpertERPHub_Audit_Securite.pdf"
PRIMARY = HexColor("#00288e")
SECONDARY = HexColor("#0058be")
RED = HexColor("#dc2626")
ORANGE = HexColor("#ea580c")
YELLOW = HexColor("#ca8a04")
GREEN = HexColor("#16a34a")
LIGHT_BG = HexColor("#f0f4ff")
WHITE = white
INK = HexColor("#191c1e")
MUTED = HexColor("#64748b")

styles = getSampleStyleSheet()

# Custom styles
styles.add(ParagraphStyle('DocTitle', parent=styles['Title'], fontSize=28, leading=34,
    textColor=PRIMARY, fontName='Helvetica-Bold', spaceAfter=6))
styles.add(ParagraphStyle('DocSubtitle', parent=styles['Normal'], fontSize=12,
    textColor=MUTED, fontName='Helvetica', spaceAfter=20))
styles.add(ParagraphStyle('SectionTitle', parent=styles['Heading1'], fontSize=16, leading=20,
    textColor=PRIMARY, fontName='Helvetica-Bold', spaceBefore=18, spaceAfter=8,
    borderWidth=0, borderPadding=0))
styles.add(ParagraphStyle('SeverityTitle', parent=styles['Heading2'], fontSize=13, leading=16,
    fontName='Helvetica-Bold', spaceBefore=14, spaceAfter=6))
styles.add(ParagraphStyle('IssueTitle', parent=styles['Heading3'], fontSize=11, leading=14,
    textColor=INK, fontName='Helvetica-Bold', spaceBefore=10, spaceAfter=4))
styles.add(ParagraphStyle('BodyTextCustom', parent=styles['Normal'], fontSize=10, leading=15,
    textColor=INK, fontName='Helvetica', spaceAfter=6))
styles.add(ParagraphStyle('CodeBlock', parent=styles['Normal'], fontSize=8.5, leading=12,
    textColor=HexColor("#1e293b"), fontName='Courier', backColor=HexColor("#f1f5f9"),
    spaceBefore=4, spaceAfter=6, leftIndent=12, rightIndent=12,
    borderWidth=0.5, borderColor=HexColor("#e2e8f0"), borderPadding=6))
styles.add(ParagraphStyle('BulletItem', parent=styles['Normal'], fontSize=10, leading=14,
    textColor=INK, fontName='Helvetica', leftIndent=18, bulletIndent=6, spaceAfter=3))
styles.add(ParagraphStyle('FooterStyle', parent=styles['Normal'], fontSize=8,
    textColor=MUTED, fontName='Helvetica', alignment=TA_CENTER))

def severity_color(sev):
    return {'CRITIQUE': RED, 'HAUTE': ORANGE, 'MOYENNE': YELLOW, 'BASSE': GREEN}.get(sev, MUTED)

def severity_badge(sev):
    c = severity_color(sev)
    return f'<font color="{c.hexval()}" size="9"><b>[{sev}]</b></font>'

def build_report():
    doc = SimpleDocTemplate(OUTPUT, pagesize=letter,
        topMargin=0.75*inch, bottomMargin=0.75*inch,
        leftMargin=0.75*inch, rightMargin=0.75*inch)
    story = []
    now = datetime.datetime.now().strftime("%d/%m/%Y")

    # ── TITLE PAGE ──
    story.append(Spacer(1, 1.5*inch))
    story.append(Paragraph("ExpertERPHub", styles['DocTitle']))
    story.append(Paragraph("Rapport d'Audit Sécurité & Tests d'Intégration API", styles['DocSubtitle']))
    story.append(HRFlowable(width="100%", thickness=2, color=PRIMARY, spaceAfter=12))
    story.append(Paragraph(f"Date : {now}", styles['BodyTextCustom']))
    story.append(Paragraph("Plateforme : expert-erp.vercel.app", styles['BodyTextCustom']))
    story.append(Paragraph("Backend : Supabase REST API (PostgREST)", styles['BodyTextCustom']))
    story.append(Paragraph("Repository : GitHub — ExpertERPHUB", styles['BodyTextCustom']))
    story.append(Spacer(1, 30))

    # Summary table
    summary_data = [
        ['Sévérité', 'Nombre', 'Statut'],
        ['CRITIQUE', '6', 'Action immédiate requise'],
        ['HAUTE', '5', 'À corriger rapidement'],
        ['MOYENNE', '4', 'À planifier'],
        ['BASSE', '3', 'Amélioration recommandée'],
    ]
    t = Table(summary_data, colWidths=[1.8*inch, 1*inch, 3*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BACKGROUND', (0, 1), (-1, 1), HexColor("#fef2f2")),
        ('BACKGROUND', (0, 2), (-1, 2), HexColor("#fff7ed")),
        ('BACKGROUND', (0, 3), (-1, 3), HexColor("#fefce8")),
        ('BACKGROUND', (0, 4), (-1, 4), HexColor("#f0fdf4")),
        ('ALIGN', (1, 0), (1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(t)
    story.append(PageBreak())

    # ── SECTION 1: CRITICAL ──
    story.append(Paragraph("1. Vulnérabilités Critiques", styles['SectionTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=RED, spaceAfter=10))

    # Issue 1
    story.append(Paragraph(f"{severity_badge('CRITIQUE')} Mot de passe admin en dur dans le code client", styles['IssueTitle']))
    story.append(Paragraph("<b>Fichiers :</b> index.html (ligne 3314), dashboard-admin.html (ligne 647)", styles['BodyTextCustom']))
    story.append(Paragraph("Le mot de passe administrateur est codé en dur dans le JavaScript côté client :", styles['BodyTextCustom']))
    story.append(Paragraph("const PORTAL_ADMIN_PASSWORD = 'erphub2026!';<br/>const ADMIN_PWD = 'erphub2026!';", styles['CodeBlock']))
    story.append(Paragraph("<b>Risque :</b> N'importe quel utilisateur peut voir le code source (F12 / DevTools) et extraire le mot de passe admin. Accès total à l'interface d'administration.", styles['BodyTextCustom']))
    story.append(Paragraph("<b>Correction :</b> Déplacer l'authentification admin côté serveur (Supabase Edge Function ou backend Node.js). Ne jamais stocker de mots de passe dans le code client.", styles['BodyTextCustom']))

    # Issue 2
    story.append(Paragraph(f"{severity_badge('CRITIQUE')} Clé API Supabase exposée côté client", styles['IssueTitle']))
    story.append(Paragraph("<b>Fichier :</b> config.js (lignes 8-9)", styles['BodyTextCustom']))
    story.append(Paragraph("var SB_URL = 'https://aqvkcbeezzbmoiykzfyo.supabase.co';<br/>var SB_KEY = 'sb_publishable_3ZOOWdx35IRT6...';", styles['CodeBlock']))
    story.append(Paragraph("<b>Risque :</b> Avec cette clé, n'importe qui peut interroger directement ta base Supabase depuis Postman ou un script. C'est normal pour une clé anon UNIQUEMENT si tu as des politiques RLS actives.", styles['BodyTextCustom']))
    story.append(Paragraph("<b>Correction :</b> Activer impérativement le Row Level Security (RLS) sur toutes les tables Supabase pour limiter les accès.", styles['BodyTextCustom']))

    # Issue 3
    story.append(Paragraph(f"{severity_badge('CRITIQUE')} Pas de Row Level Security (RLS) détecté", styles['IssueTitle']))
    story.append(Paragraph("Toutes les requêtes utilisent la clé anon avec <b>select=*</b>. Sans RLS, la clé publique donne accès en lecture/écriture à toutes les données.", styles['BodyTextCustom']))
    story.append(Paragraph("fetch('https://...supabase.co/rest/v1/consultants?select=*', {<br/>&nbsp;&nbsp;headers: { apikey: 'ta_clé_publique' }<br/>})", styles['CodeBlock']))
    story.append(Paragraph("<b>Risque :</b> Fuite de données complète — emails, téléphones, hash de mots de passe, données entreprises. N'importe qui peut lire, modifier ou supprimer des enregistrements.", styles['BodyTextCustom']))
    story.append(Paragraph("<b>Correction :</b> Activer RLS dans le dashboard Supabase → Authentication → Policies. Créer des politiques pour chaque table qui limitent les lectures/écritures selon le rôle.", styles['BodyTextCustom']))

    # Issue 4
    story.append(Paragraph(f"{severity_badge('CRITIQUE')} Mots de passe hashés en SHA256 sans sel", styles['IssueTitle']))
    story.append(Paragraph("<b>Fichier :</b> supabase-helpers.js (lignes 105-112)", styles['BodyTextCustom']))
    story.append(Paragraph("Les mots de passe consultants sont hashés avec SHA256 simple (sans sel/salt) puis stockés dans notes_admin.auth_password_sha256.", styles['BodyTextCustom']))
    story.append(Paragraph("<b>Risque :</b> SHA256 sans sel est vulnérable aux attaques par tables arc-en-ciel. Un attaquant qui accède à la base peut craquer tous les mots de passe en minutes.", styles['BodyTextCustom']))
    story.append(Paragraph("<b>Correction :</b> Migrer vers bcrypt ou Argon2 côté serveur (Supabase Edge Function). Ajouter un sel unique par utilisateur.", styles['BodyTextCustom']))

    # Issue 5
    story.append(Paragraph(f"{severity_badge('CRITIQUE')} Portail admin accessible via ?admin=1 dans l'URL", styles['IssueTitle']))
    story.append(Paragraph("<b>Fichier :</b> index.html (ligne 3520)", styles['BodyTextCustom']))
    story.append(Paragraph("params.get('admin') === '1'  // Révèle l'interface admin", styles['CodeBlock']))
    story.append(Paragraph("<b>Risque :</b> N'importe qui peut ajouter ?admin=1 à l'URL pour voir l'interface admin, puis utiliser le mot de passe codé en dur (issue #1) pour y accéder.", styles['BodyTextCustom']))

    # Issue 6
    story.append(Paragraph(f"{severity_badge('CRITIQUE')} Token secret codé en dur côté client", styles['IssueTitle']))
    story.append(Paragraph("<b>Fichier :</b> config.js (ligne 17)", styles['BodyTextCustom']))
    story.append(Paragraph("var ACCESS_TOKEN_SECRET = 'erphub_secure_2026';", styles['CodeBlock']))
    story.append(Paragraph("<b>Risque :</b> Si des JWT sont signés avec ce secret, n'importe qui peut forger des tokens valides.", styles['BodyTextCustom']))

    story.append(PageBreak())

    # ── SECTION 2: HIGH ──
    story.append(Paragraph("2. Vulnérabilités Hautes", styles['SectionTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=ORANGE, spaceAfter=10))

    high_issues = [
        ("Sessions localStorage non chiffrées",
         "portal-auth.js stocke les sessions (rôle, email, adminGranted) en clair dans localStorage. Un script XSS peut voler ces données.",
         "Utiliser des cookies HttpOnly côté serveur pour les sessions sensibles."),
        ("Risque XSS — innerHTML sans échappement systématique",
         "Certains endroits utilisent innerHTML sans passer par escapeHtml(). Exemple : dashboard-consultant.html ligne 2083 injecte config.icon et config.text sans sanitization.",
         "Toujours utiliser escapeHtml() avant d'insérer du contenu dynamique dans innerHTML."),
        ("Tokens d'accès passés dans l'URL",
         "Les tokens de récupération de mot de passe sont transmis via les paramètres URL (access_token dans le hash). Ils se retrouvent dans l'historique du navigateur et les logs serveur.",
         "Utiliser des requêtes POST pour transmettre les tokens sensibles."),
        ("Pas de rate limiting sur les tentatives de connexion",
         "Aucune limite visible sur le nombre de tentatives de connexion. Un attaquant peut tester des milliers de mots de passe par force brute.",
         "Implémenter un rate limiting côté serveur (max 5 tentatives par minute par IP)."),
        ("Email admin exposé dans le code source",
         "config.js contient : ADMIN_EMAILS = ['sofianehmiyou9@gmail.com']. Visible par tous dans le code source.",
         "Déplacer la vérification admin côté serveur."),
    ]
    for title, risk, fix in high_issues:
        story.append(Paragraph(f"{severity_badge('HAUTE')} {title}", styles['IssueTitle']))
        story.append(Paragraph(f"<b>Risque :</b> {risk}", styles['BodyTextCustom']))
        story.append(Paragraph(f"<b>Correction :</b> {fix}", styles['BodyTextCustom']))

    story.append(PageBreak())

    # ── SECTION 3: MEDIUM + LOW ──
    story.append(Paragraph("3. Vulnérabilités Moyennes et Basses", styles['SectionTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=YELLOW, spaceAfter=10))

    med_issues = [
        ("MOYENNE", "Données consultants accessibles sans authentification",
         "sbSelectPublicConsultants() récupère tous les consultants approuvés avec select=*. Les informations (email, téléphone, ville) sont accessibles publiquement."),
        ("MOYENNE", "Pas de validation de force de mot de passe",
         "Aucune vérification côté client ni serveur de la complexité des mots de passe (longueur, caractères spéciaux)."),
        ("MOYENNE", "Pas d'enforcement HTTPS visible",
         "Pas de redirection HTTP→HTTPS ni d'en-têtes HSTS détectés dans le code. (Vercel le gère peut-être automatiquement.)"),
        ("BASSE", "Messages d'erreur incohérents",
         "Certains messages révèlent si un email existe ou non, permettant l'énumération d'utilisateurs."),
        ("BASSE", "Cache avatar en localStorage",
         "Les URLs de photos sont stockées en localStorage sans nécessité de sécurité."),
        ("BASSE", "Comparaison de mot de passe non constante",
         "La comparaison admin utilise !== (vulnérable aux timing attacks théoriques)."),
    ]
    for sev, title, desc in med_issues:
        story.append(Paragraph(f"{severity_badge(sev)} {title}", styles['IssueTitle']))
        story.append(Paragraph(desc, styles['BodyTextCustom']))

    story.append(PageBreak())

    # ── SECTION 4: TESTS API ──
    story.append(Paragraph("4. Tests d'Intégration API", styles['SectionTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=10))

    story.append(Paragraph("Un fichier de tests automatisés a été créé : <b>tests/api-integration-tests.js</b>", styles['BodyTextCustom']))
    story.append(Paragraph("Pour l'exécuter depuis ton terminal PowerShell :", styles['BodyTextCustom']))
    story.append(Paragraph("cd C:\\Users\\sofia\\OneDrive\\Desktop\\ExpertERPHUB<br/>node tests/api-integration-tests.js", styles['CodeBlock']))

    tests_data = [
        ['#', 'Test', 'Description'],
        ['1', 'GET /consultants', 'Liste tous les consultants — vérifie retour tableau'],
        ['2', 'GET /consultants?email=eq...', 'Filtre par email — vérifie résultat filtré'],
        ['3', 'GET /consultants (filtre ERP)', 'Filtre par spécialisation ERP'],
        ['4', 'GET /entreprises', 'Liste les entreprises inscrites'],
        ['5', 'Champs sensibles', 'Vérifie si auth_password_sha256 est exposé via anon key'],
        ['6', 'POST /consultants', 'Teste les permissions d\'insertion'],
        ['7', 'PATCH /consultants', 'Teste les permissions de modification'],
        ['8', 'Requête sans clé API', 'Vérifie le rejet des requêtes non authentifiées'],
        ['9', 'Clé API invalide', 'Vérifie le rejet des clés incorrectes'],
        ['10', 'Syntaxe filtres', 'Valide les opérateurs PostgREST (eq., ilike.)'],
        ['11', 'Headers réponse', 'Vérifie Content-Type: application/json'],
        ['12', 'Table inexistante', 'Vérifie gestion d\'erreur 404'],
    ]
    t2 = Table(tests_data, colWidths=[0.4*inch, 2*inch, 3.8*inch])
    t2.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, LIGHT_BG]),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('ALIGN', (0, 0), (0, -1), 'CENTER'),
    ]))
    story.append(t2)

    story.append(PageBreak())

    # ── SECTION 5: PLAN D'ACTION ──
    story.append(Paragraph("5. Plan d'Action Prioritaire", styles['SectionTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=GREEN, spaceAfter=10))

    actions = [
        ("Immédiat (cette semaine)", RED, [
            "Activer RLS sur toutes les tables Supabase (consultants, entreprises, messages)",
            "Supprimer le mot de passe admin du code client — créer une Supabase Edge Function",
            "Supprimer ACCESS_TOKEN_SECRET du code client",
            "Supprimer ?admin=1 comme mécanisme d'accès",
        ]),
        ("Court terme (2 semaines)", ORANGE, [
            "Migrer le hash SHA256 vers bcrypt via Edge Function",
            "Implémenter un rate limiting sur les endpoints d'authentification",
            "Arrêter de passer les tokens dans les URLs",
            "Auditer tous les innerHTML pour XSS",
        ]),
        ("Moyen terme (1 mois)", YELLOW, [
            "Déplacer toute la logique d'authentification côté serveur",
            "Implémenter des sessions HttpOnly cookies",
            "Ajouter des en-têtes de sécurité (HSTS, CSP, X-Frame-Options)",
            "Mettre en place des tests de sécurité automatisés dans le CI/CD",
        ]),
    ]
    for period, color, items in actions:
        story.append(Paragraph(f'<font color="{color.hexval()}"><b>{period}</b></font>', styles['SeverityTitle']))
        for item in items:
            story.append(Paragraph(f"• {item}", styles['BulletItem']))
        story.append(Spacer(1, 8))

    # ── FOOTER ──
    story.append(Spacer(1, 30))
    story.append(HRFlowable(width="100%", thickness=1, color=HexColor("#e2e8f0"), spaceAfter=8))
    story.append(Paragraph("ExpertERPHub — Rapport d'Audit Sécurité — Confidentiel", styles['FooterStyle']))
    story.append(Paragraph(f"Généré le {now} — 18 vulnérabilités identifiées — 12 tests API créés", styles['FooterStyle']))

    doc.build(story)
    print(f"✅ Rapport généré : {OUTPUT}")

if __name__ == '__main__':
    build_report()
