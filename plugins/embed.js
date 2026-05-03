const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require("discord.js");
const e = require("@assets/emojis/black.js");

const COLORS = {
  success: 0x57F287,
  error:   0xED4245,
  info:    0x5865F2,
  music:   0x9B59B6,
  warning: 0xFEE75C,
  neutral: 0x2B2D31,
  premium: 0xF1C40F,
};

function buildSimple(icon, text, color) {
  const c = new ContainerBuilder().setAccentColor(color);
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`${icon} ${text}`)
  );
  return c;
}

function success(text) { return buildSimple(e.yes,  text, COLORS.success); }
function error(text)   { return buildSimple(e.no,   text, COLORS.error);   }
function info(text)    { return buildSimple(e.info, text, COLORS.info);    }
function warn(text)    { return buildSimple(e.warn, text, COLORS.warning); }

function music(title, body, footer = null, color = COLORS.music) {
  const c = new ContainerBuilder().setAccentColor(color);
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`## ${e.music} ${title}`)
  );
  c.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(body)
  );
  if (footer) {
    c.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`-# ${footer}`)
    );
  }
  return c;
}

function send(container) {
  return { components: [container], flags: MessageFlags.IsComponentsV2 };
}

module.exports = { success, error, info, warn, music, send, COLORS };
