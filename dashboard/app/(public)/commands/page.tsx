import { Music2, Sliders, ListMusic, Settings, Info, Shield } from "lucide-react";

const COMMANDS: Record<string, { name: string; args: string; desc: string }[]> = {
  music: [
    { name:"play",       args:"<query/url>",   desc:"Play a track or playlist from any supported source."            },
    { name:"pause",      args:"",              desc:"Pause the current track."                                        },
    { name:"resume",     args:"",              desc:"Resume a paused track."                                          },
    { name:"skip",       args:"",              desc:"Skip the current track and play the next one."                   },
    { name:"stop",       args:"",              desc:"Stop playback, clear the queue, and disconnect."                 },
    { name:"nowplaying", args:"",              desc:"Display the currently playing track with controls."              },
    { name:"queue",      args:"[page]",        desc:"View the full queue with pagination."                            },
    { name:"shuffle",    args:"",              desc:"Shuffle the current queue randomly."                             },
    { name:"loop",       args:"[track/queue]", desc:"Loop the current track or entire queue."                         },
    { name:"seek",       args:"<time>",        desc:"Seek to a specific timestamp in the track."                     },
    { name:"volume",     args:"[1-200]",       desc:"Set or check the current volume."                               },
    { name:"remove",     args:"<position>",    desc:"Remove a specific track from the queue."                        },
    { name:"clear",      args:"",              desc:"Clear all tracks from the queue."                                },
    { name:"move",       args:"<from> <to>",   desc:"Move a track to a different queue position."                    },
    { name:"jump",       args:"<position>",    desc:"Jump to a specific track in the queue."                         },
    { name:"lyrics",     args:"[query]",       desc:"Get lyrics for the current or specified song."                  },
    { name:"search",     args:"<query>",       desc:"Search and choose from top 10 results."                         },
    { name:"autoplay",   args:"",              desc:"Toggle autoplay mode (queues related tracks)."                   },
    { name:"247",        args:"",              desc:"Toggle 24/7 mode to keep bot in voice channel."                  },
    { name:"history",    args:"",              desc:"View recently played tracks this session."                       },
  ],
  filters: [
    { name:"filter",    args:"[name]", desc:"Apply or browse audio filters."                      },
    { name:"bassboost", args:"",       desc:"Apply bass boost filter."                             },
    { name:"nightcore", args:"",       desc:"Apply nightcore (speed + pitch up)."                 },
    { name:"vaporwave", args:"",       desc:"Apply vaporwave (slow + pitch down)."                },
    { name:"8d",        args:"",       desc:"Apply 8D audio rotation effect."                     },
    { name:"karaoke",   args:"",       desc:"Apply karaoke vocal-removal filter."                 },
    { name:"soft",      args:"",       desc:"Apply soft low-pass filter."                         },
    { name:"reset",     args:"",       desc:"Remove all active audio filters."                    },
  ],
  playlist: [
    { name:"playlist create", args:"<name>",       desc:"Create a new personal playlist."                 },
    { name:"playlist load",   args:"<name>",       desc:"Load a saved playlist into the queue."          },
    { name:"playlist save",   args:"<name>",       desc:"Save the current queue as a playlist."          },
    { name:"playlist add",    args:"<name> <url>", desc:"Add a track to a saved playlist."              },
    { name:"playlist remove", args:"<name> <#>",   desc:"Remove a track from a saved playlist."         },
    { name:"playlist list",   args:"",             desc:"List all your saved playlists."                 },
    { name:"playlist delete", args:"<name>",       desc:"Delete a saved playlist."                       },
  ],
  config: [
    { name:"prefix",        args:"<prefix>",  desc:"Change the bot command prefix for this server."      },
    { name:"djrole",        args:"[role]",    desc:"Set or remove the DJ role restriction."              },
    { name:"musicchannel",  args:"[channel]", desc:"Restrict commands to a specific channel."            },
    { name:"settings",      args:"",          desc:"View and manage all server settings."                },
    { name:"defaultvolume", args:"<1-200>",   desc:"Set the default volume for new sessions."           },
    { name:"announce",      args:"",          desc:"Toggle song announcements in chat."                  },
  ],
  utility: [
    { name:"help",    args:"[cmd/cat]", desc:"View all commands or get details on a specific one."  },
    { name:"ping",    args:"",          desc:"Check the bot latency and API response time."          },
    { name:"uptime",  args:"",          desc:"View how long the bot has been running."               },
    { name:"stats",   args:"",          desc:"View global bot statistics."                           },
    { name:"invite",  args:"",          desc:"Get the bot invite link."                              },
    { name:"vote",    args:"",          desc:"Vote for Chiku on top.gg."                             },
    { name:"support", args:"",          desc:"Get a link to the support Discord server."             },
  ],
};

const CAT_ICONS: Record<string, React.ReactNode> = {
  music:    <Music2 className="w-4 h-4"    />,
  filters:  <Sliders className="w-4 h-4"  />,
  playlist: <ListMusic className="w-4 h-4"/>,
  config:   <Settings className="w-4 h-4" />,
  utility:  <Info className="w-4 h-4"     />,
};

const CAT_DESCS: Record<string, string> = {
  music:    "Playback, queue, and audio controls",
  filters:  "Audio effect presets",
  playlist: "Save & load your playlists",
  config:   "Server configuration",
  utility:  "Bot info & utilities",
};

const TOTAL = Object.values(COMMANDS).flat().length;

export default function CommandsPage() {
  return (
    <div className="text-white">
      {/* Hero */}
      <section className="relative px-5 py-28 text-center overflow-hidden">
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute inset-0 bg-radial-glow" />
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.04] text-xs text-white/42 font-semibold mb-8 backdrop-blur-sm">
            <Shield className="w-3.5 h-3.5" /> {TOTAL}+ commands, all free
          </div>
          <h1 className="page-title mb-7">
            Full command<br /><span className="text-gradient">reference</span>
          </h1>
          <p className="text-lg text-white/38 max-w-xl mx-auto leading-7">
            Every command Chiku supports, organized by category with syntax and descriptions.
          </p>
        </div>
      </section>

      {/* Prefix hint */}
      <div className="max-w-4xl mx-auto px-5 mb-5">
        <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
          <div className="w-1.5 h-1.5 rounded-full bg-white/30 flex-shrink-0" />
          <span className="text-[13px] text-white/35">
            Default prefix:{" "}
            <code className="text-white/55 bg-white/[0.07] border border-white/[0.08] px-1.5 py-0.5 rounded-lg font-mono text-xs">!</code>
            {" "}— change with{" "}
            <code className="text-white/55 bg-white/[0.07] border border-white/[0.08] px-1.5 py-0.5 rounded-lg font-mono text-xs">!prefix &lt;new&gt;</code>
            {" "}or via the Settings page in the dashboard.
          </span>
        </div>
      </div>

      {/* Commands */}
      <section className="px-5 pb-28 max-w-4xl mx-auto space-y-4">
        {Object.entries(COMMANDS).map(([cat, cmds]) => (
          <div key={cat} className="glass-card overflow-hidden">
            {/* Category header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.055]">
              <div className="w-9 h-9 rounded-xl border border-white/[0.07] bg-white/[0.035] flex items-center justify-center text-white/42">
                {CAT_ICONS[cat]}
              </div>
              <div>
                <h2 className="font-bold text-sm capitalize">{cat}</h2>
                <p className="text-[11px] text-white/28">{CAT_DESCS[cat]} · {cmds.length} commands</p>
              </div>
            </div>
            {/* Commands list */}
            <div>
              {cmds.map(({ name, args, desc }, i) => (
                <div key={name}
                  className={`cmd-row ${i !== cmds.length - 1 ? "border-b border-white/[0.04]" : ""}`}>
                  <div className="flex items-center gap-2 min-w-0 sm:min-w-[240px] flex-shrink-0">
                    <code className="text-[13px] font-black text-white font-mono">!{name}</code>
                    {args && (
                      <code className="text-[11px] text-white/28 font-mono bg-white/[0.04] px-1.5 py-0.5 rounded-md border border-white/[0.06]">
                        {args}
                      </code>
                    )}
                  </div>
                  <p className="text-[13px] text-white/38 flex-1 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
