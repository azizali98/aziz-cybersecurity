// Add new articles here. Keep each post's id unique.
// Article body supports simple paragraphs, headings, bullet lists, and code blocks.
window.SITE_POSTS = [
  {
    id: "htb-opensecret",
    section: "htb",
    title: "OpenSecret — Challenge Notes",
    date: "2026-10-30",
    difficulty: "Easy",
    readTime: "6 min read",
    tags: ["HTB", "Web", "Enumeration"],
    excerpt: "A structured place to document the initial enumeration, key observations, and lessons from the OpenSecret challenge.",
    body: [
      {type:"p", text:"This is a starter write-up template. Replace the example content with your own verified observations before publishing."},
      {type:"h3", text:"1. Scope and enumeration"},
      {type:"p", text:"Record the target address, exposed services, versions, and the exact commands used. Keep testing within the lab scope."},
      {type:"code", text:"nmap -sC -sV -oN nmap.txt TARGET_IP"},
      {type:"h3", text:"2. Key observations"},
      {type:"ul", items:["What did you discover?","Which observation changed your direction?","How did you validate the finding?"]},
      {type:"h3", text:"3. Lessons learned"},
      {type:"p", text:"Explain the reasoning behind each step, not just a list of commands. Add screenshots and sanitized evidence where useful."}
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
  }
];