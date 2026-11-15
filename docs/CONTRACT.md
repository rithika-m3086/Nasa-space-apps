# CONTRACT (R owns engine/store, G owns UI). Change only via a commit titled "contract: ..." and tell the other person.

## Store: src/store/useMission.js (zustand). R1 ships a STUB with fixture data; R2 replaces internals, same shape.
State:
status: 'idle'|'running'|'ended'
step: 'allocate'|'event'|'report'
config: { cadetName, avatar, site:'moon'|'mars', difficulty:'cadet'|'commander', mode:'free'|'daily'|'class', seed }
day: 1..7  (UI label: Day on moon, Sol on mars)
gauges: { power, life, shield }  // 0-100; power = battery
science: number
sunlight: 0..1, dust: 0..1, energyToday: int, available: int (= power + energyToday)
allocation: { life, shield, science }  // ints, multiples of 5
event: Event|null; lastOutcome: { optionId, effects, capcom, why }|null
crew: [{ id, name, trait, mood:'happy'|'ok'|'worried' }]
dayLog: [{ day, gauges, science, eventId, optionId, allocation }]
safeModeAvailable: bool; rewindTokens: int; endReason: null|'complete'|'life_zero'; rank: null|'Cadet'|'Pilot'|'Commander'|'Flight Director'
live: { sun: { status:'idle'|'loading'|'ok'|'fallback', source:'live'|'snapshot', flareClass, date, text } }
profile: { stickers:[id], missionsPlayed, sessionMissions, sessionStartedAt, best:{moon,mars} }
Actions: startMission(config), adjustAllocation(key, delta), autoBalance(), lockAllocation(), chooseOption(optionId), nextDay(), activateSafeMode(), rewindTo(day), resetMission(), fetchRealSun()
Selectors (functions of state): selectDayLabel(site), selectAllocationTip(state)->string, selectDebrief(state), selectStickerCatalog(state), selectShouldSuggestBreak(state), selectShareCode(state)
selectDebrief -> { rank, survived, days, humanSeries:[{day,power,life,shield,science}], ghostSeries:[same], lessons:[{day,text}], radiation:{ crewDoseMsvPerDay, refs:[{id,label,msvPerDay,note,sourceId}] }, shareCode, stickersEarned:[id] }
Helpers exported from src/engine: getDailySeed() (UTC date string), normalizeClassCode(text)
Dev: stub honors URL ?s=title|allocate|event|report|ended&site=moon|mars

## Data shapes (src/data)
Event: { id, sites:['moon','mars'], kind:'flare'|'dust'|'micrometeorite'|'equipment'|'crew'|'discovery'|'comms', title, kid, why, options:[{ id, label, hint, tag:'safe'|'balanced'|'risky', effects:{power,life,shield,science}, shieldScaled:bool, capcom }], science:{ headline, mission, instrument, fact, sourceId }, image?:{nasaId} }
Source: { id, title, org, url, note, usedFor }

## Balance (tested by a Python prototype; R2 reproduces in vitest)
days 7; start power 60, life 80, shield 75, science 0.
moon: gen 34, shieldDrain 9, sun [.9,.8,.9,.6,.8,.9,.7], dust all 0. mars: gen 26, shieldDrain 5, sun [.9,.9,.8,.7,.5,.6,.8], dust [0,.1,.1,.3,.7,.5,.2]. (Sun and dust are GAME-SCALED.)
cadet: lifeDrain 13, eff .85, eventScale .8, rewinds 2. commander: lifeDrain 16, eff .75, eventScale 1.1, rewinds 1.
Each day: energyToday = round(gen * sun * (1 - .6*dust)); available = power + energyToday; spend L+S+G <= available (scale down if over); power' = clamp(available - spend).
life' = life - lifeDrain + eff*L + .12*G; shield' = shield - shieldDrain + eff*S; science += G. If shield < 25: life -= 6 (shield = 0: -12).
Event harm to life is multiplied by (1 - .6*shield/100) when shieldScaled. Safe mode once per mission when min(life,shield,power) < 15: +20 power, +10 life, +10 shield. life <= 0 ends the run as a Learning Report.
Target (2000 seeds): balanced policy survives >= 95% in all four site/difficulty combos, ending min(life,shield) about 46-49 (cadet), 27-38 (commander). Spend-nothing survives < 5%. All-science on commander survives < 20%. Random clicks on cadet survive > 95%.
Radiation refs (real): Mars cruise 1.8 mSv/day, Mars surface 0.67 mSv/day (Curiosity RAD), ISS about 100 mSv per 6 months (~0.55/day).
