/**
 * Quiz Question Pool (English): cybersecurity
 */

export const cybersecurityQuestions = [
  {
    id: "cybersecurity-en-1",
    category: "Cybersecurity",
    q: "What is the primary function of Multi-Factor Authentication (MFA / 2FA)?",
    options: [
      {
        text: "To increase broadband internet download speeds",
        isCorrect: false,
        explanation: "MFA has no bearing on network bandwidth."
      },
      {
        text: "To provide a second barrier protecting accounts even if the primary password is compromised",
        isCorrect: true,
        explanation: "Requiring an independent second verification factor prevents unauthorized access upon password exposure."
      },
      {
        text: "To store automated cloud backup snapshots",
        isCorrect: false,
        explanation: "That is backup storage functionality."
      },
      {
        text: "To wipe temporary browser cache daily",
        isCorrect: false,
        explanation: "That is system maintenance functionality."
      },
    ]
  },
  {
    id: "cybersecurity-en-2",
    category: "Cybersecurity",
    q: "Which password structure demonstrates high resilience against brute-force cracking?",
    options: [
      {
        text: "A first name followed by birth year (e.g., John1990)",
        isCorrect: false,
        explanation: "Easily cracked using wordlists and personal profiling."
      },
      {
        text: "A lengthy passphrase (\u226514 characters) mixing uppercase, lowercase, numbers, and symbols",
        isCorrect: true,
        explanation: "Length and high entropy exponentially expand the mathematical space required for brute-force computation."
      },
      {
        text: "A single shared password reused across all services",
        isCorrect: false,
        explanation: "Creates systemic cascading risk across every account."
      },
      {
        text: "Sequential numeric patterns (12345678)",
        isCorrect: false,
        explanation: "The most frequently tested combinations in credential stuffing."
      },
    ]
  },
  {
    id: "cybersecurity-en-3",
    category: "Cybersecurity",
    q: "Why does utilizing public open Wi-Fi without a VPN pose severe risks for sensitive transactions?",
    options: [
      {
        text: "Adversaries on the local network can execute Man-in-the-Middle (MitM) attacks and intercept unencrypted traffic",
        isCorrect: true,
        explanation: "Shared untrusted networks permit packet sniffing and rogue gateway spoofing."
      },
      {
        text: "Laptop batteries will exhaust within 5 minutes",
        isCorrect: false,
        explanation: "Wi-Fi connections do not accelerate power draw dramatically."
      },
      {
        text: "Screen displays will invert colors involuntarily",
        isCorrect: false,
        explanation: "Display orientation is an OS setting."
      },
      {
        text: "Device GPS antennas are permanently disabled",
        isCorrect: false,
        explanation: "Satellite GPS is independent of local Wi-Fi."
      },
    ]
  },
  {
    id: "cybersecurity-en-4",
    category: "Cybersecurity",
    q: "What is the core benefit of utilizing a dedicated password manager (e.g., Bitwarden, 1Password)?",
    options: [
      {
        text: "Accelerating document typing speeds",
        isCorrect: false,
        explanation: "Not an automated typing tool."
      },
      {
        text: "Generating and securely storing distinct, complex credentials for every service in an encrypted vault",
        isCorrect: true,
        explanation: "Password managers eliminate unsafe password reuse by managing unique passphrases per service."
      },
      {
        text: "Automatically deleting software viruses",
        isCorrect: false,
        explanation: "That is antivirus functionality."
      },
      {
        text: "Monetizing credential telemetry to third parties",
        isCorrect: false,
        explanation: "Trusted managers utilize zero-knowledge client-side encryption."
      },
    ]
  },
  {
    id: "cybersecurity-en-5",
    category: "Cybersecurity",
    q: "What critical hazard results from neglecting operating system and browser updates?",
    options: [
      {
        text: "Displays permanently switch to monochrome",
        isCorrect: false,
        explanation: "Not a display hardware symptom."
      },
      {
        text: "Unpatched vulnerabilities can be weaponized by automated exploits and malware",
        isCorrect: true,
        explanation: "Routine software patches resolve documented zero-days and critical security vulnerabilities."
      },
      {
        text: "Storage drives double their storage capacity",
        isCorrect: false,
        explanation: "Updates require disk storage."
      },
      {
        text: "Input peripherals are permanently locked",
        isCorrect: false,
        explanation: "Standard hardware remains functional."
      },
    ]
  },
  {
    id: "cybersecurity-en-6",
    category: "Cybersecurity",
    q: "What defines 'Ransomware'?",
    options: [
      {
        text: "Freeware productivity software",
        isCorrect: false,
        explanation: "Not open-source utility software."
      },
      {
        text: "Malicious software that encrypts user data and extorts financial payment for decryption keys",
        isCorrect: true,
        explanation: "Ransomware locks access to corporate and personal files to demand monetary ransoms."
      },
      {
        text: "High-voltage rapid charging hardware",
        isCorrect: false,
        explanation: "Not a power accessory."
      },
      {
        text: "Public cloud archival infrastructure",
        isCorrect: false,
        explanation: "Not remote storage infrastructure."
      },
    ]
  },
  {
    id: "cybersecurity-en-7",
    category: "Cybersecurity",
    q: "What does 'Shoulder Surfing' signify in physical social engineering?",
    options: [
      {
        text: "Navigating surfboards in rough waters",
        isCorrect: false,
        explanation: "Not an aquatic activity."
      },
      {
        text: "Directly observing a victim over their shoulder as they enter ATM PINs or computer passwords",
        isCorrect: true,
        explanation: "A conventional physical credential-harvesting method relying on direct visual line-of-sight."
      },
      {
        text: "Transmitting spam to email address books",
        isCorrect: false,
        explanation: "That is email spamming."
      },
      {
        text: "Modifying a co-worker's desktop wallpaper",
        isCorrect: false,
        explanation: "Harmless office prank."
      },
    ]
  },
  {
    id: "cybersecurity-en-8",
    category: "Cybersecurity",
    q: "Why are authenticator applications (TOTP) significantly safer than SMS OTPs?",
    options: [
      {
        text: "Authenticator apps operate offline and remain immune to SIM Swap hijacking attacks",
        isCorrect: true,
        explanation: "SMS messages can be rerouted via telecommunication social engineering or compromised carrier portals."
      },
      {
        text: "SMS messages cost $100 per verification code",
        isCorrect: false,
        explanation: "SMS costs are nominal or carrier-absorbed."
      },
      {
        text: "Authenticator apps can forecast upcoming events",
        isCorrect: false,
        explanation: "TOTP algorithms rely on synchronized Unix timestamps, not divination."
      },
      {
        text: "Legacy phones cannot receive SMS messages",
        isCorrect: false,
        explanation: "SMS is universally supported across mobile handsets."
      },
    ]
  },
  {
    id: "cybersecurity-en-9",
    category: "Cybersecurity",
    q: "How does a 'Brute Force' attack target authentication systems?",
    options: [
      {
        text: "Physically vandalizing server hardware with sledgehammers",
        isCorrect: false,
        explanation: "Not a physical destruction attack."
      },
      {
        text: "Systematically attempting millions of credential combinations until a valid match is found",
        isCorrect: true,
        explanation: "Automated programmatic guessing leveraging dictionary wordlists or permutations."
      },
      {
        text: "Severing power grid lines to data centers",
        isCorrect: false,
        explanation: "That is physical infrastructure sabotage."
      },
      {
        text: "Filing administrative lawsuits against webmasters",
        isCorrect: false,
        explanation: "Not a legal mechanism."
      },
    ]
  },
  {
    id: "cybersecurity-en-10",
    category: "Cybersecurity",
    q: "What constitutes a 'Zero-Day Vulnerability'?",
    options: [
      {
        text: "A security flaw unknown to developers or lacking an official software patch at the time of discovery",
        isCorrect: true,
        explanation: "Developers have had 'zero days' to prepare defenses because exploits emerged prior to remediation."
      },
      {
        text: "Software engineered in zero days",
        isCorrect: false,
        explanation: "Not related to development sprints."
      },
      {
        text: "Systems permanently free from software bugs",
        isCorrect: false,
        explanation: "No computer system is completely flawless."
      },
      {
        text: "Unmetered internet data plans",
        isCorrect: false,
        explanation: "Commercial connectivity bundle."
      },
    ]
  },
  {
    id: "cybersecurity-en-11",
    category: "Cybersecurity",
    q: "What does the 'Principle of Least Privilege' (PoLP) dictate?",
    options: [
      {
        text: "All users must be assigned universal administrative root rights",
        isCorrect: false,
        explanation: "A catastrophic security violation."
      },
      {
        text: "Users should be granted only the minimum permissions strictly necessary to execute their assigned roles",
        isCorrect: true,
        explanation: "Restricting privilege boundaries limits lateral damage if an account is compromised."
      },
      {
        text: "Employees must be prohibited from using office computing devices",
        isCorrect: false,
        explanation: "Disrupts standard operational workflows."
      },
      {
        text: "Passwords may contain no more than three characters",
        isCorrect: false,
        explanation: "Severely insecure practice."
      },
    ]
  },
  {
    id: "cybersecurity-en-12",
    category: "Cybersecurity",
    q: "What risk arises from plugging an unknown USB flash drive found in an office parking lot (USB Dropping)?",
    options: [
      {
        text: "System memory automatically expands",
        isCorrect: false,
        explanation: "Flash drives act as external mass storage."
      },
      {
        text: "The drive may be weaponized to automatically deploy malicious keystrokes or trojans (BadUSB)",
        isCorrect: true,
        explanation: "USB dropping exploits human curiosity to bridge air-gapped or internal corporate networks."
      },
      {
        text: "Computer monitors alternate flashing hues",
        isCorrect: false,
        explanation: "Not a direct payload characteristic."
      },
      {
        text: "Keyboard layouts switch to foreign dialects",
        isCorrect: false,
        explanation: "Not the operational objective of BadUSB."
      },
    ]
  },
  {
    id: "cybersecurity-en-13",
    category: "Cybersecurity",
    q: "If your email address appears on 'Have I Been Pwned', it indicates:",
    options: [
      {
        text: "Your email provider has terminated your account",
        isCorrect: false,
        explanation: "Accounts are not automatically removed."
      },
      {
        text: "Your email and potentially associated passwords were leaked in a third-party corporate data breach",
        isCorrect: true,
        explanation: "Public breach records confirm your credentials were exposed; rotate passwords immediately."
      },
      {
        text: "You won an international cybersecurity sweepstakes",
        isCorrect: false,
        explanation: "Not a sweepstakes registry."
      },
      {
        text: "Your physical device is actively controlled by hackers",
        isCorrect: false,
        explanation: "The breach occurred at a third-party cloud service database."
      },
    ]
  },
  {
    id: "cybersecurity-en-14",
    category: "Cybersecurity",
    q: "What is the safest protocol when selling or recycling a used smartphone?",
    options: [
      {
        text: "Deleting photos from the gallery and clearing chat history",
        isCorrect: false,
        explanation: "Deleted records can be reconstructed with forensic recovery tools."
      },
      {
        text: "Performing a full Factory Reset with comprehensive hardware encryption enabled",
        isCorrect: true,
        explanation: "Purges cryptographic encryption keys, returning the storage medium to factory baseline."
      },
      {
        text: "Replacing the SIM card with a new subscriber card",
        isCorrect: false,
        explanation: "Internal flash storage remains populated with residual data."
      },
      {
        text: "Powering the device off for 24 continuous hours",
        isCorrect: false,
        explanation: "Solid-state memory is non-volatile and persists indefinitely."
      },
    ]
  },
  {
    id: "cybersecurity-en-15",
    category: "Cybersecurity",
    q: "What threat does 'Session Hijacking' present?",
    options: [
      {
        text: "Disrupting corporate physical fitness workshops",
        isCorrect: false,
        explanation: "Not an athletic term."
      },
      {
        text: "An adversary steals valid session cookie tokens to impersonate the user without supplying their password",
        isCorrect: true,
        explanation: "Session tokens grant authenticated access until explicitly invalidated or expired."
      },
      {
        text: "Extending account subscription terms gratis",
        isCorrect: false,
        explanation: "Not an adversarial benefit."
      },
      {
        text: "Uninstalling the browser executable from storage",
        isCorrect: false,
        explanation: "Not a session hijacking objective."
      },
    ]
  },
];

export default cybersecurityQuestions;
