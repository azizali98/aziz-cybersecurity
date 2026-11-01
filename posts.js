// Add new articles here. Keep each post's id unique.
// Article body supports simple paragraphs, headings, bullet lists, and code blocks.
window.SITE_POSTS = [
  {
  id: "htb-support",
  section: "htb",
  title: "Support — Active Directory",
  date: "2026-11-01",
  difficulty: "Easy",
  readTime: "12 min read",
  tags: ["HTB", "Active Directory", "SMB", "LDAP", "BloodHound", "RBCD"],
  excerpt: "An Active Directory attack path involving SMB enumeration, .NET reverse engineering, credential discovery, WinRM access, and Resource-Based Constrained Delegation.",
  body: [
    {type:"p", text:"Support is an Active Directory lab focused on enumeration, credential discovery, and delegation-based privilege escalation. This write-up follows the observations and commands recorded during the machine walkthrough."},

    {type:"h3", text:"1. Initial enumeration"},
    {type:"p", text:"The initial Nmap scan identified DNS, Kerberos, LDAP, SMB, and WinRM. LDAP revealed the domain name support.htb. Replace TARGET_IP with the current HTB target address because the IP may change after a reset."},
    {type:"code", text:"nmap -sC -sV -oN nmap.txt TARGET_IP"},

    {type:"h3", text:"2. SMB enumeration"},
    {type:"p", text:"Listing the SMB shares revealed an accessible support-tools share containing portable utilities, including UserInfo.exe.zip."},
    {type:"code", text:"smbclient -L //TARGET_IP/\nsmbclient //TARGET_IP/support-tools\nls\nget UserInfo.exe.zip"},

    {type:"h3", text:"3. Reverse-engineering UserInfo.exe"},
    {type:"p", text:"After extracting the archive, I decompiled the .NET executable with ILSpy to inspect its credential-handling logic."},
    {type:"code", text:"ilspycmd UserInfo.exe > UserInfo.cs"},
    {type:"p", text:"The observed implementation used Base64 decoding and a repeating key with an XOR transformation. Reproducing that transformation revealed a credential used in subsequent domain enumeration."},

    {type:"h3", text:"4. LDAP and BloodHound"},
    {type:"p", text:"I used bloodhound-python to collect Active Directory data, then inspected the resulting relationships in BloodHound. LDAP searches exposed additional account information and a credential associated with the support account."},
    {type:"code", text:"bloodhound-python --dns-tcp -ns TARGET_IP -d support.htb -u ldap -p 'RECOVERED_PASSWORD' -c all"},
    {type:"code", text:"ldapsearch -H ldap://support.htb -D 'ldap@support.htb' -w 'RECOVERED_PASSWORD' -b 'dc=support,dc=htb'"},
    {type:"p", text:"The discovered support credential was validated against SMB before attempting remote access."},

    {type:"h3", text:"5. Initial access through WinRM"},
    {type:"p", text:"WinRM was exposed on TCP port 5985. Using the recovered support credentials, I established a remote PowerShell session and located the user flag on the account's desktop."},
    {type:"code", text:"evil-winrm -i TARGET_IP -u support -p 'SUPPORT_PASSWORD'"},
    {type:"code", text:"cd C:\\Users\\support\\Desktop\ndir\ntype user.txt"},

    {type:"h3", text:"6. MachineAccountQuota"},
    {type:"p", text:"Further enumeration showed that ms-DS-MachineAccountQuota was set to 10. This setting permits eligible domain users to create machine accounts, but the quota alone does not grant administrator privileges."},
    {type:"code", text:"Get-DomainObject -Identity 'DC=SUPPORT,DC=HTB' | Select-Object ms-DS-MachineAccountQuota"},

    {type:"h3", text:"7. Resource-Based Constrained Delegation"},
    {type:"p", text:"The privilege-escalation path used a controlled computer account and the target computer object's msDS-AllowedToActOnBehalfOfOtherIdentity attribute. After configuring the relevant delegation relationship, the workflow used Rubeus to request a service ticket while impersonating Administrator."},
    {type:"ul", items:["Create a controlled computer account using the lab's authorized tooling.","Inspect the target computer object's permissions and delegation attribute.","Request the appropriate S4U service ticket with Rubeus.","Convert the ticket to a credential-cache format when required.","Use Kerberos authentication against the correct domain host."]},
    {type:"p", text:"The exact computer name, service principal, and permissions must match the current lab environment. Verify each value rather than copying stale IP addresses or hostnames."},

    {type:"h3", text:"8. Kerberos ticket handling"},
    {type:"p", text:"The recorded workflow used ticketConverter.py to convert the ticket into a credential-cache file. KRB5CCNAME identifies that cache for compatible Kerberos-aware tools."},
    {type:"code", text:"python3 ticketConverter.py ticket.kirbi ticket.ccache\nexport KRB5CCNAME=ticket.ccache"},

    {type:"h3", text:"9. Root flag"},
    {type:"p", text:"After successful privileged authentication, the Administrator desktop contained root.txt. Flag values are intentionally omitted from this public write-up."},

    {type:"h3", text:"10. Lessons learned"},
    {type:"ul", items:["Inspect accessible SMB shares for tools that may reveal useful implementation details.","Decompile .NET applications when their credential-handling logic is relevant.","Combine LDAP enumeration with BloodHound to understand domain relationships and permissions.","Treat MachineAccountQuota as one part of the attack path, not proof of privilege escalation by itself.","Review computer-object ACLs and RBCD configuration to understand the actual security weakness.","Avoid publishing credentials, ticket material, or HTB flag values."]}
  ]
},
  {
    id: "htb-writeup-template",
    section: "htb",
    title: "A Repeatable HTB Enumeration Workflow",
    date: "2026-10-28",
    difficulty: "Medium",
    readTime: "8 min read",
    tags: ["HTB", "Linux", "Methodology"],
    excerpt: "A practical checklist for keeping enumeration methodical instead of jumping between tools.",
    body: [
      {type:"p", text:"Use this workflow only in authorized labs. Enumeration is iterative: every result should inform the next test."},
      {type:"h3", text:"1. Establish the attack surface"},
      {type:"ul", items:["Confirm the target IP and lab scope.","Run a port scan and save the output.","Enumerate each open service separately.","Keep a timestamped notes file."]},
      {type:"h3", text:"2. Track hypotheses"},
      {type:"p", text:"For every lead, write down the evidence, the hypothesis, the next safe test, and the result. This prevents repeated work."},
      {type:"code", text:"mkdir -p recon/{scans,web,notes,evidence}\nscript -a recon/notes/session.log"},
      {type:"h3", text:"3. Close the loop"},
      {type:"p", text:"After finishing, document the root cause, the evidence that proved it, and one defensive lesson."}
    ]
  },
  {
    id: "bb-testing-checklist",
    section: "research",
    title: "Web Testing: Evidence-First Checklist",
    date: "2026-10-25",
    difficulty: "Research",
    readTime: "5 min read",
    tags: ["Bug Bounty", "Burp Suite", "Workflow"],
    excerpt: "A compact process for validating a finding, keeping clean evidence, and avoiding unsupported impact claims.",
    body: [
      {type:"p", text:"Only test assets that are explicitly in scope and follow the program's rules. Use test accounts and non-destructive requests."},
      {type:"h3", text:"Before testing"},
      {type:"ul", items:["Read the scope, exclusions, and rate limits.","Identify the account and role used for each request.","Save the baseline request and response."]},
      {type:"h3", text:"Validate the difference"},
      {type:"ul", items:["Change one variable at a time.","Repeat the test to rule out a transient result.","Compare status, body, and relevant security behavior.","Do not claim impact that you did not demonstrate."]},
      {type:"h3", text:"Report clearly"},
      {type:"p", text:"Include a concise summary, reproducible steps, expected versus actual behavior, evidence, and realistic impact. Remove secrets and personal data."}
    ]
  },
  {
    id: "burp-notes",
    section: "notes",
    title: "Burp Suite: Request Comparison Notes",
    date: "2026-10-22",
    difficulty: "Cheatsheet",
    readTime: "4 min read",
    tags: ["Burp Suite", "Web", "HTTP"],
    excerpt: "A simple approach to comparing baseline and modified requests while investigating web behavior.",
    body: [
      {type:"h3", text:"Workflow"},
      {type:"ul", items:["Send the baseline request to Repeater.","Save the original response before editing anything.","Modify a single parameter or header.","Compare response status, body, length, and timing.","Repeat with a controlled test account if authorization behavior is involved."]},
      {type:"h3", text:"Keep notes"},
      {type:"p", text:"Record what changed, what stayed the same, and what evidence supports your conclusion. A different response alone does not automatically prove a vulnerability."}
    ]
  },
  {
    id: "linux-notes",
    section: "notes",
    title: "Linux Commands for Lab Notes",
    date: "2026-10-20",
    difficulty: "Cheatsheet",
    readTime: "3 min read",
    tags: ["Linux", "CLI", "Workflow"],
    excerpt: "Useful commands for organizing output and keeping a repeatable record of lab work.",
    body: [
      {type:"h3", text:"Save command output"},
      {type:"code", text:"command | tee output.txt\ncommand > output.txt 2>&1"},
      {type:"h3", text:"Search saved text"},
      {type:"code", text:"grep -Rni \"keyword\" ./notes/\nfind . -type f -name '*.txt'"},
      {type:"h3", text:"Good habits"},
      {type:"ul", items:["Save outputs with meaningful filenames.","Avoid storing credentials or live tokens in public notes.","Redact secrets before publishing."]}
    ]
  },
  {
    id: "api-security-notes",
    section: "notes",
    title: "API Security: First-Pass Review",
    date: "2026-10-18",
    difficulty: "Notes",
    readTime: "5 min read",
    tags: ["API", "Access Control", "Web"],
    excerpt: "A high-level checklist for reviewing authentication, object access, input handling, and error behavior.",
    body: [
      {type:"p", text:"Use this checklist only against APIs you own or are authorized to assess."},
      {type:"ul", items:["Map endpoints and methods from documented or observed application flows.","Understand which identity and role each request represents.","Check object-level access with two accounts you control.","Review input validation and mass-assignment behavior without modifying real user data.","Look for sensitive information in errors and responses.","Document the baseline and the exact reproducible difference."]},
      {type:"p", text:"Treat unusual behavior as a lead to validate, not as a confirmed vulnerability by itself."}
    ]
  },
];
