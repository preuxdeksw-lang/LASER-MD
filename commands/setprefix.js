const fs = require("fs");
const path = require("path");
const isOwnerOrSudo = require("../lib/isOwner");
const settings = require("../settings");

function savePrefix(newPrefix) {
    try {
        const settingsPath = path.join(__dirname, "..", "settings.js");
        let data = fs.readFileSync(settingsPath, "utf8");

        const prefixRegex = /module\.exports\.prefix\s*=\s*['"`].*?['"`];?/;

        if (prefixRegex.test(data)) {
            data = data.replace(prefixRegex, `module.exports.prefix = '${newPrefix}';`);
        } else {
            data += `\nmodule.exports.prefix = '${newPrefix}';\n`;
        }

        fs.writeFileSync(settingsPath, data, "utf8");
        return true;
    } catch (err) {
        console.error("SavePrefix Error:", err);
        return false;
    }
}

async function setPrefixCommand(sock, chatId, message) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;

        const text =
            message.message?.conversation ||
            message.message?.extendedTextMessage?.text ||
            "";

        const args = text.trim().split(/\s+/);
        const newPrefix = args[1];

        const allowed = await isOwnerOrSudo(senderId);

        if (!allowed) {
            return await sock.sendMessage(
                chatId,
                { text: "❌ Owner oswa Sudo sèlman." },
                { quoted: message }
            );
        }

        if (!newPrefix) {
            return await sock.sendMessage(
                chatId,
                { text: `📌 Exemple : ${settings.prefix || "."}setprefix !` },
                { quoted: message }
            );
        }

        if (newPrefix.length > 3) {
            return await sock.sendMessage(
                chatId,
                { text: "❌ Prefix pa dwe plis pase 3 karaktè." },
                { quoted: message }
            );
        }

        const saved = savePrefix(newPrefix);

        if (!saved) {
            return await sock.sendMessage(
                chatId,
                { text: "❌ Bot pa t ka sove prefix la." },
                { quoted: message }
            );
        }

        await sock.sendMessage(
            chatId,
            { text: `✅ Nouveau prefix : *${newPrefix}*` },
            { quoted: message }
        );
    } catch (error) {
        console.error("SetPrefix Command Error:", error);

        await sock.sendMessage(
            chatId,
            { text: "❌ Erreur pandan chanjman prefix." },
            { quoted: message }
        );
    }
}

module.exports = setPrefixCommand;
