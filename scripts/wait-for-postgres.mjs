/**
 * 輪詢本機 TCP 埠，直到 PostgreSQL 接受連線（供 docker compose 啟動後接 migrate）。
 * 預設 127.0.0.1:5432；可設 WAIT_DB_HOST / WAIT_DB_PORT / WAIT_DB_TIMEOUT_MS。
 */
import net from "node:net";

const host = process.env.WAIT_DB_HOST ?? "127.0.0.1";
const port = Number(process.env.WAIT_DB_PORT ?? "5432", 10);
const timeoutMs = Number(process.env.WAIT_DB_TIMEOUT_MS ?? "90000", 10);

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function tryConnectOnce() {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port }, () => {
      socket.end();
      resolve(true);
    });
    socket.on("error", () => {
      socket.destroy();
      resolve(false);
    });
  });
}

async function main() {
  const deadline = Date.now() + timeoutMs;
  process.stdout.write(`[wait-for-postgres] 等待 ${host}:${port} …\n`);
  for (;;) {
    if (await tryConnectOnce()) {
      process.stdout.write(`[wait-for-postgres] 已就緒\n`);
      return;
    }
    if (Date.now() >= deadline) {
      process.stderr.write(
        `[wait-for-postgres] 逾時（${timeoutMs}ms），請確認 Docker 已啟動且埠未被占用\n`,
      );
      process.exit(1);
    }
    await sleep(400);
  }
}

await main();
