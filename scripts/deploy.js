import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import solc from "solc";

const RPC_URL = "http://127.0.0.1:8545";

// Hardhat default first account private key (local only)
const PRIVATE_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

/**
 * Compile a specific contract from a Solidity file
 */
function compile(contractFile, contractName) {
  const contractPath = path.resolve("contracts", contractFile);
  const source = fs.readFileSync(contractPath, "utf8");

  const input = {
    language: "Solidity",
    sources: {
      [contractFile]: { content: source },
    },
    settings: {
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode"],
        },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (!output.contracts?.[contractFile]?.[contractName]) {
    throw new Error(`Contract ${contractName} not found in ${contractFile}`);
  }

  return output.contracts[contractFile][contractName];
}

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  const network = await provider.getNetwork();
  console.log("Network chainId:", network.chainId.toString());

  // ✅ Compile correct contracts explicitly
  const authCompiled = compile(
    "AuthorizationManager.sol",
    "AuthorizationManager"
  );

  const vaultCompiled = compile(
    "SecureVault.sol",
    "SecureVault"
  );

  // ✅ Deploy AuthorizationManager
  const AuthFactory = new ethers.ContractFactory(
    authCompiled.abi,
    authCompiled.evm.bytecode.object,
    wallet
  );

  const authManager = await AuthFactory.deploy();
  await authManager.waitForDeployment();

  console.log("AuthorizationManager deployed to:", authManager.target);

  // ✅ Deploy SecureVault with constructor argument
  const VaultFactory = new ethers.ContractFactory(
    vaultCompiled.abi,
    vaultCompiled.evm.bytecode.object,
    wallet
  );

  const vault = await VaultFactory.deploy(authManager.target);
  await vault.waitForDeployment();

  console.log("SecureVault deployed to:", vault.target);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
