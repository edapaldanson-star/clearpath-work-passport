# Clearpath Work Passport

Build a functional onboarding and compliance web app for Legal, Regulatory & Financial Access (SDGs 8, 10 & 16), clearing administrative friction around work authorization, employer compliance, and banking/payment access so qualified candidates can legally work, get paid, and contract smoothly.

Focus on the East Africa / Kenya regional corridor (supporting national workers, foreign residents, and displaced/refugee talent with UNHCR or Alien cards).

Start with the candidate onboarding portal for document upload and payout setup:
1. Candidate Identity & Eligibility Verification:
- Document upload supporting National ID, Passport, Alien Card (Foreign National Certificate), or UNHCR Refugee Mandate / Refugee Registration Certificate (Class M permit eligibility).
- Automated OCR extraction simulation, document authenticity indicator, and sanctions/PEP check status.
- Tax compliance step: KRA PIN input / non-resident tax declaration, and digital W-8BEN withholding agreement with electronic signature.

2. Payout Rails & Banking Access Setup:
- Mobile Money: Safaricom M-Pesa setup (registered phone number, account name verification check).
- Local Bank: Pesalink / interbank transfer (bank selection, account number, branch/routing code).
- Cross-border multi-currency: Virtual USD/EUR account payout options (e.g. Deel / Wise).

3. Compliance Clearance Status & Audit Dossier:
- Live verification progress tracker (Document Check, Tax Clearance, Payout Verified, Ready to Work).
- Downloadable/viewable compliance certificate and audit trail dossier for employers to verify legal right-to-work and payment compliance.

4. Include a toggle or navigation between the Candidate Onboarding Portal and an Employer Compliance Dashboard where employers can review submitted candidate dossiers, view compliance status, approve onboarding, and inspect contracts and tax forms.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://clearpath-work-passport.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/659ec89e-24a7-4a21-89db-7b91a6c4ad9a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
