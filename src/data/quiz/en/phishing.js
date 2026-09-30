/**
 * Quiz Question Pool (English): phishing
 */

export const phishingQuestions = [
  {
    id: "phishing-en-1",
    category: "Phishing",
    q: "You receive an email from 'security-alert@bank-verification-login.com' claiming your account will be suspended in 24 hours unless you verify. What should you do?",
    options: [
      {
        text: "Immediately click the link to prevent account suspension",
        isCorrect: false,
        explanation: "Clicking links from unverified senders exposes you to credential harvesting."
      },
      {
        text: "Inspect the sender domain; legitimate banks use their official domain (e.g., bank.com), not third-party lookalikes",
        isCorrect: true,
        explanation: "Banks use official, verified domain names and never issue unilateral email ultimatums."
      },
      {
        text: "Reply asking for their customer service phone number",
        isCorrect: false,
        explanation: "Replying confirms your email address is active to scammers."
      },
      {
        text: "Send a photo of your bank card as proof",
        isCorrect: false,
        explanation: "Never share financial documents with unverified entities."
      },
    ]
  },
  {
    id: "phishing-en-2",
    category: "Phishing",
    q: "A WhatsApp message claiming to be from a delivery courier attaches a file named 'Package_Delivery_Photo.apk'. What is the primary threat?",
    options: [
      {
        text: "The file immediately deletes all gallery photos",
        isCorrect: false,
        explanation: "The primary objective is credential theft and SMS OTP interception."
      },
      {
        text: "It is an Android malware package capable of reading incoming SMS OTP codes for banking theft",
        isCorrect: true,
        explanation: "Malicious APKs request SMS accessibility permissions to steal two-factor authentication tokens."
      },
      {
        text: "It consumes mobile data rapidly",
        isCorrect: false,
        explanation: "While data is used, the critical threat is banking drain."
      },
      {
        text: "It forces your phone to make international calls",
        isCorrect: false,
        explanation: "Malware prioritizes exfiltrating financial credentials."
      },
    ]
  },
  {
    id: "phishing-en-3",
    category: "Phishing",
    q: "What does 'typosquatting' mean in the context of cyber attacks?",
    options: [
      {
        text: "Typing quickly on a keyboard without looking at the screen",
        isCorrect: false,
        explanation: "Not related to typing speed."
      },
      {
        text: "Registering domain names intentionally similar to popular websites with minor misspellings",
        isCorrect: true,
        explanation: "Typosquatting registers lookalike domains like exxample.com or paypa1.com to trick unsuspecting users."
      },
      {
        text: "Sending bulk emails with random punctuation",
        isCorrect: false,
        explanation: "That is typical spam filtering evasion."
      },
      {
        text: "Changing account passwords on a regular basis",
        isCorrect: false,
        explanation: "That is a recommended security hygiene practice."
      },
    ]
  },
  {
    id: "phishing-en-4",
    category: "Phishing",
    q: "Why does the presence of an HTTPS padlock NOT guarantee that a website is legitimate?",
    options: [
      {
        text: "HTTPS only encrypts data in transit; free SSL certificates are easily acquired by fraudsters",
        isCorrect: true,
        explanation: "SSL/TLS certificates only verify encrypted transmission, not the moral integrity or legality of the website operator."
      },
      {
        text: "HTTPS is obsolete and replaced by HTTP 3.0",
        isCorrect: false,
        explanation: "HTTPS remains the current standard for web encryption."
      },
      {
        text: "Padlocks are now exclusively reserved for government websites",
        isCorrect: false,
        explanation: "Any website operator can acquire an SSL certificate."
      },
      {
        text: "All paid domains are automatically vetted by financial regulators",
        isCorrect: false,
        explanation: "Domain registrars do not verify regulatory standing."
      },
    ]
  },
  {
    id: "phishing-en-5",
    category: "Phishing",
    q: "A phone caller claiming to represent your bank cites your debit card number and demands your SMS OTP. What should you do?",
    options: [
      {
        text: "Disclose the OTP since they already know your card number",
        isCorrect: false,
        explanation: "Card numbers can leak in third-party breaches; OTPs remain confidential."
      },
      {
        text: "Refuse to share the OTP, hang up immediately, and call the bank's official support line",
        isCorrect: true,
        explanation: "Bank representatives will never ask for your one-time passwords or PIN under any circumstances."
      },
      {
        text: "Provide only the first 3 digits of the OTP code",
        isCorrect: false,
        explanation: "Partial OTP disclosure is still a severe compromise."
      },
      {
        text: "Request that they email you a physical letter first",
        isCorrect: false,
        explanation: "Terminate the call immediately and report the incident."
      },
    ]
  },
  {
    id: "phishing-en-6",
    category: "Phishing",
    q: "A shortened SMS link reads 'bit.ly/gov-support-grant-2026'. What is the primary hazard of shortened URLs?",
    options: [
      {
        text: "They can only be opened on desktop computers",
        isCorrect: false,
        explanation: "Short links work on any web-enabled device."
      },
      {
        text: "They obscure the true destination domain, which may lead to a malicious phishing site",
        isCorrect: true,
        explanation: "URL shorteners conceal deceptive hostnames from initial visual inspection."
      },
      {
        text: "They cause device batteries to overheat",
        isCorrect: false,
        explanation: "No hardware battery impact occurs directly."
      },
      {
        text: "They delete browser navigation history",
        isCorrect: false,
        explanation: "Short URLs have no special browser history permissions."
      },
    ]
  },
  {
    id: "phishing-en-7",
    category: "Phishing",
    q: "What distinguishing characteristic defines a 'Spear Phishing' attack?",
    options: [
      {
        text: "Attacks are customized and targeted at specific individuals using gathered personal intelligence",
        isCorrect: true,
        explanation: "Spear phishing leverages pre-collected personal information to craft highly convincing lures."
      },
      {
        text: "Physical weapons are deployed in the real world",
        isCorrect: false,
        explanation: "It is an entirely digital cyberattack vector."
      },
      {
        text: "It only affects Linux operating systems",
        isCorrect: false,
        explanation: "Spear phishing targets humans on any operating system."
      },
      {
        text: "It is exclusively broadcast over radio frequencies",
        isCorrect: false,
        explanation: "Delivered via email, direct message, or messaging apps."
      },
    ]
  },
  {
    id: "phishing-en-8",
    category: "Phishing",
    q: "A website promises a free $500 balance if you log in with your Google account in a pop-up window. What does this indicate?",
    options: [
      {
        text: "An authorized promotional campaign by Google",
        isCorrect: false,
        explanation: "Google does not disburse funds via third-party websites."
      },
      {
        text: "A deceptive Credential Harvesting / OAuth token theft attempt",
        isCorrect: true,
        explanation: "Spoofed pop-ups are designed to harvest credentials or illicitly grant third-party OAuth access."
      },
      {
        text: "Official Single Sign-On integration",
        isCorrect: false,
        explanation: "Untrusted third-party origins are not genuine partners."
      },
      {
        text: "Annual lottery giveaway notification",
        isCorrect: false,
        explanation: "Classic recurring advance fee scam pattern."
      },
    ]
  },
  {
    id: "phishing-en-9",
    category: "Phishing",
    q: "What must you inspect in an email header to reliably detect 'Email Spoofing'?",
    options: [
      {
        text: "Only the display name shown on screen",
        isCorrect: false,
        explanation: "Display names are easily forged by anyone."
      },
      {
        text: "The complete email headers, specifically Return-Path, SPF, and DKIM verification results",
        isCorrect: true,
        explanation: "Underlying message headers reveal the authentic origin server and cryptographic signature."
      },
      {
        text: "The count of paragraphs in the email body",
        isCorrect: false,
        explanation: "Length has no correlation with cryptographic authenticity."
      },
      {
        text: "The color palette used in the brand logo",
        isCorrect: false,
        explanation: "Logos are easily duplicated and embedded."
      },
    ]
  },
  {
    id: "phishing-en-10",
    category: "Phishing",
    q: "An Instagram message from a friend states: 'Please vote for me in this contest; send me the 6-digit SMS code you receive'. What is happening?",
    options: [
      {
        text: "Your friend is participating in a legitimate contest",
        isCorrect: false,
        explanation: "This is an account takeover mechanism."
      },
      {
        text: "Your friend's account is compromised and the attacker is trying to reset your own account password via SMS OTP",
        isCorrect: true,
        explanation: "The 6-digit code is an account recovery token aimed at seizing control of your profile."
      },
      {
        text: "Instagram is running an official rewarded challenge",
        isCorrect: false,
        explanation: "Not an authorized platform procedure."
      },
      {
        text: "The platform requires multi-device re-authentication",
        isCorrect: false,
        explanation: "Not a valid authorization mechanism."
      },
    ]
  },
  {
    id: "phishing-en-11",
    category: "Phishing",
    q: "What danger arises from scanning unverified QR codes in public places (Quishing)?",
    options: [
      {
        text: "The smartphone camera lens physically shatters",
        isCorrect: false,
        explanation: "Hardware is unaffected."
      },
      {
        text: "Malicious QR codes can redirect your browser to credential phishing sites or trigger automated payload downloads",
        isCorrect: true,
        explanation: "Quishing replaces legitimate QR stickers (e.g., parking, menus, payments) with malicious redirections."
      },
      {
        text: "The phone automatically changes system display languages",
        isCorrect: false,
        explanation: "Not a typical exploit behavior."
      },
      {
        text: "Emergency contacts are wiped instantly",
        isCorrect: false,
        explanation: "Not a standard QR redirect consequence."
      },
    ]
  },
  {
    id: "phishing-en-12",
    category: "Phishing",
    q: "A website address appears as 'https://www.bank.com.login-verify.site'. What is the true registrable domain?",
    options: [
      {
        text: "bank.com",
        isCorrect: false,
        explanation: "bank.com is merely an arbitrary subdomain prefix here."
      },
      {
        text: "login-verify.site",
        isCorrect: true,
        explanation: "The effective registrable domain is immediately preceding the TLD: login-verify.site."
      },
      {
        text: "com.login-verify",
        isCorrect: false,
        explanation: "Incorrect DNS hierarchy resolution."
      },
      {
        text: "www.bank.com",
        isCorrect: false,
        explanation: "Not the active root domain hosting the service."
      },
    ]
  },
  {
    id: "phishing-en-13",
    category: "Phishing",
    q: "What is the immediate priority if you mistakenly enter your password into a phishing webpage?",
    options: [
      {
        text: "Close your laptop and leave it untouched for three days",
        isCorrect: false,
        explanation: "Delaying action facilitates unauthorized access."
      },
      {
        text: "Change your credentials on the official website immediately and terminate active sessions / enable 2FA",
        isCorrect: true,
        explanation: "Prompt credential rotation invalidates the compromised password before attackers capitalize on it."
      },
      {
        text: "Clear your browser cookie cache",
        isCorrect: false,
        explanation: "The attacker already has the harvested credentials on their remote server."
      },
      {
        text: "Reply to the phishing administrator asking for forgiveness",
        isCorrect: false,
        explanation: "Do not communicate with malicious actors."
      },
    ]
  },
  {
    id: "phishing-en-14",
    category: "Phishing",
    q: "Why should attachments formatted as '.svg' or '.html' from unknown senders be treated with suspicion?",
    options: [
      {
        text: "They occupy excessive storage space",
        isCorrect: false,
        explanation: "Vector and markup files are typically very lightweight."
      },
      {
        text: "Both formats can embed and execute malicious JavaScript scripts upon opening in a browser",
        isCorrect: true,
        explanation: "SVG and HTML files can execute inline scripts to perform drive-by downloads or steal session cookies."
      },
      {
        text: "SVG files can only be rendered on 3D printers",
        isCorrect: false,
        explanation: "SVG is a standard 2D web vector format."
      },
      {
        text: "HTML is banned by international internet governance",
        isCorrect: false,
        explanation: "HTML is the foundational language of the World Wide Web."
      },
    ]
  },
  {
    id: "phishing-en-15",
    category: "Phishing",
    q: "An SMS states: 'Your rewards points expire today! Redeem immediately at http://points-telecom.xyz'. What is the primary red flag?",
    options: [
      {
        text: "The word 'Points'",
        isCorrect: false,
        explanation: "Points is standard commercial terminology."
      },
      {
        text: "Manufactured artificial urgency ('expires today') combined with an unofficial .xyz domain instead of telecom.com",
        isCorrect: true,
        explanation: "Creating panic forces hasty decisions before the user inspects the fraudulent domain name."
      },
      {
        text: "The sender ID contains four digits",
        isCorrect: false,
        explanation: "Official SMS aggregators frequently utilize shortcodes."
      },
      {
        text: "It arrived during standard business hours",
        isCorrect: false,
        explanation: "Delivery timing is not a primary threat indicator."
      },
    ]
  },
];

export default phishingQuestions;
