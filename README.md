

<body>

<h1>Authorization-Governed Vault System</h1>

<p>
This project implements a <strong>two-contract vault architecture</strong> where
ETH withdrawals are permitted only after <strong>explicit on-chain authorization validation</strong>.
The design deliberately avoids cryptographic signature verification inside the vault,
instead enforcing strict authorization consumption rules via a dedicated manager contract.
</p>

<h2>Overview</h2>
<p>
The system separates <strong>authorization logic</strong> from <strong>fund custody</strong>.
This reduces attack surface, enforces single-use permissions, and prevents loosely scoped withdrawals.
</p>

<h2>Architecture</h2>

<h3>AuthorizationManager</h3>
<ul>
    <li>Validates withdrawal permissions</li>
    <li>Consumes each authorization exactly once</li>
    <li>Prevents replay or reuse of approvals</li>
</ul>

<h3>SecureVault</h3>
<ul>
    <li>Holds ETH</li>
    <li>Initiates withdrawals only after authorization confirmation</li>
    <li>Delegates permission checks to AuthorizationManager</li>
</ul>

<div class="highlight">
<strong>Key Design Choice:</strong><br>
The vault itself does <strong>not</strong> verify cryptographic signatures.
Authorization correctness is enforced through deterministic hash validation
and strict state transitions.
</div>

<h2>Local Deployment</h2>

<h3>Prerequisites</h3>
<ul>
    <li>Docker</li>
    <li>Docker Compose</li>
</ul>

<h3>Run the System</h3>
<pre>
docker-compose up
</pre>

<p>This will:</p>
<ul>
    <li>Start a local Hardhat blockchain</li>
    <li>Deploy <strong>AuthorizationManager</strong></li>
    <li>Deploy <strong>SecureVault</strong></li>
    <li>Output deployed contract addresses to logs</li>
</ul>

<h3>RPC Endpoint</h3>
<pre>
http://localhost:8545
</pre>

<h2>Manual Authorization Flow</h2>

<h3>1. Deposit ETH</h3>
<p>
Any address can send ETH directly to the <strong>SecureVault</strong> contract.
No authorization is required for deposits.
</p>

<h3>2. Generate Authorization (Off-Chain)</h3>
<p>
The following parameters must be agreed off-chain:
</p>
<ul>
    <li>Vault address</li>
    <li>Recipient address</li>
    <li>Withdrawal amount</li>
    <li>Unique nonce</li>
    <li>Chain ID</li>
</ul>

<h3>3. Execute Withdrawal</h3>
<p>
Call the following function on <strong>SecureVault</strong>:
</p>
<pre>
withdraw(recipient, amount, nonce)
</pre>

<h3>4. Authorization Validation</h3>
<ul>
    <li>SecureVault calls AuthorizationManager</li>
    <li>Authorization hash is verified and marked as used</li>
    <li>Reuse of the same authorization will revert</li>
</ul>

<h2>Security Guarantees</h2>

<div class="success">
<ul>
    <li>Authorizations are strictly single-use</li>
    <li>State updates occur <strong>before</strong> ETH transfer</li>
    <li>Withdrawals are bound to vault address and chain ID</li>
    <li>No implicit or reusable permissions exist</li>
</ul>
</div>

<h2>Common Mistakes Avoided</h2>

<div class="warning">
<ul>
    <li>No authorization reuse</li>
    <li>No ETH transfer before state mutation</li>
    <li>No loosely scoped or global permissions</li>
    <li>No duplicated effects across contracts</li>
</ul>
</div>

<h2>Design Intent (Important)</h2>
<p>
This system intentionally avoids embedding signature verification inside the vault.
Instead, it demonstrates a pattern where <strong>authorization correctness</strong>,
<strong>consumption guarantees</strong>, and <strong>execution safety</strong> are enforced
through contract separation and deterministic state control.
</p>

</body>
</html>
