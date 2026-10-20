# Dr. Muhammad Aasim Farooqui Clinic — Complete Website + CRM (from scratch bundle)

A ready-to-customize clinic website and management portal built with HTML, CSS, JavaScript, Google Apps Script and Google Sheets. This bundle includes a public customer website, separate admin login, separate CRM dashboard, fictional sample records, privacy/terms pages, backend source and deployment instructions.

## Start here
1. Extract this ZIP. Open the `clinic-website` folder.
2. Open `index.html` in a browser to preview the customer website. For best testing, run a local static server or publish to GitHub Pages.
3. Open `admin/index.html` for the separate admin login.
4. **Demo login:** enter any valid email (for example `admin@example.com`) and password **`12345678`**.
5. The dashboard uses fictional sample data while `assets/js/api.js` still contains `PASTE_APPS_SCRIPT_WEB_APP_URL_HERE`. Demo changes live only in memory and reset after reload. A visible DEMO MODE marker is shown.

## Pages and features
- `index.html`: clinic homepage, service information, appointment request, appointment tracking, review and enquiry flows.
- `admin/index.html`: separate administrator login.
- `admin/dashboard.html`: separate CRM portal with dashboard analytics, daily schedule, appointment management, patient CRM, enquiries, reviews, reports/CSV, holidays, clinic profile, services and activity log.
- `privacy.html` and `terms.html`: starter policy pages to customize before launch.
- `assets/js/demo.js`: sample/demo mode and fictional records.
- `google-apps-script/Code.gs`: Google Sheets backend source.

## Configure live Google Sheets backend
1. Create a new Google Sheet.
2. Open **Extensions → Apps Script**. Paste the contents of `google-apps-script/Code.gs` into the Apps Script editor.
3. Run `setup()` once and grant the required permissions. This creates the required tabs and headers.
4. For a quick initial admin account, run `setDefaultAdmin()` once. It creates `admin@clinic.local` with password `12345678` using a salted hash in Script Properties. For real deployment, change this to a real administrator email and a strong unique password by running `setAdmin('your-real-email@example.com','your-strong-unique-password')` from the editor. Do not publish real credentials in source code.
5. Deploy as a **Web app** and copy the deployment URL. Review Google Apps Script access settings for your clinic's privacy/security needs.
6. In `assets/js/api.js`, replace `PASTE_APPS_SCRIPT_WEB_APP_URL_HERE` with the deployed URL.
7. Test appointment submission, tracking, admin sign-in, updates, exports and mobile layouts before launch.
8. Publish the contents of `clinic-website` to GitHub Pages or another static host. Use `/admin/` for sign-in.

## Important security and clinical-data notes
- `12345678` is intended only for demo/testing or initial setup. It is a weak password; change it before any real deployment.
- Demo login is client-side and is NOT secure authentication. Never use demo mode for real patient records. Live admin authentication is checked by the Apps Script backend.
- The included sample records are fictional. Replace clinic contact details, services, policies, doctor credentials, address and maps only with verified information.
- Do not store diagnoses or detailed medical history in free-text administrative notes. Restrict access to the spreadsheet and Apps Script deployment, and assess applicable privacy requirements before collecting real patient information.
- This package has not been deployed to your Google account. The live Apps Script integration requires your own setup and testing.


## Homepage design update
The customer homepage uses a warm ivory, evergreen, jade, and restrained saffron palette, with a responsive clinic illustration instead of an invented doctor photograph. Doctor qualifications, phone number, WhatsApp number, and actual patient testimonials must be supplied/verified by the clinic. Demo CRM records use fictional names and are labelled as samples; remove demo mode before production.
