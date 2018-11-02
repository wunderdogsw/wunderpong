parcelRequire=function(e,r,n,t){var i="function"==typeof parcelRequire&&parcelRequire,o="function"==typeof require&&require;function u(n,t){if(!r[n]){if(!e[n]){var f="function"==typeof parcelRequire&&parcelRequire;if(!t&&f)return f(n,!0);if(i)return i(n,!0);if(o&&"string"==typeof n)return o(n);var c=new Error("Cannot find module '"+n+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[n][1][r]||r};var l=r[n]=new u.Module(n);e[n][0].call(l.exports,p,l,l.exports,this)}return r[n].exports;function p(e){return u(p.resolve(e))}}u.isParcelRequire=!0,u.Module=function(e){this.id=e,this.bundle=u,this.exports={}},u.modules=e,u.cache=r,u.parent=i,u.register=function(r,n){e[r]=[function(e,r){r.exports=n},{}]};for(var f=0;f<n.length;f++)u(n[f]);if(n.length){var c=u(n[n.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=c:"function"==typeof define&&define.amd?define(function(){return c}):t&&(this[t]=c)}return u}({"PTgE":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.runMigrationScript=exports.getLadder=exports.getMigrations=exports.getMatches=exports.postMatch=exports.getPlayer=void 0;var e=require("pg"),t=require("dotenv"),a=E(t),n=require("camelcase-keys"),r=E(n),s=require("path"),o=E(s),i=require("fs"),c=E(i);function E(e){return e&&e.__esModule?e:{default:e}}"production"!==process.env.NODE_ENV&&a.default.load();const u=new e.Pool({connectionString:process.env.DATABASE_URL,ssl:"production"===process.env.NODE_ENV}),l=exports.getPlayer=(async e=>{const t=await u.connect(),a=await t.query({name:"get-player",text:'\n      WITH newplayers AS (\n        INSERT INTO players ("name") VALUES ($1)\n        ON CONFLICT DO NOTHING \n        RETURNING *\n      ) \n      SELECT * FROM newplayers\n      UNION ALL\n      SELECT * FROM players WHERE "name" LIKE $1',values:[e]});return await t.release(),a&&a.rows&&a.rows[0]}),p=exports.postMatch=(async(e,t)=>{const a=await u.connect(),n={name:"add-match",text:'\n      INSERT INTO "public"."matches"("winner", "loser", "winner_rating", "loser_rating")\n      VALUES($1, $2, $3, $4)\n      RETURNING "id", "created_at", "winner", "loser";\n    ',values:[e.name,t.name,e.rating,t.rating]},s=await a.query(n);return await a.release(),s&&s.rows&&s.rows[0]&&(0,r.default)(s.rows[0])}),w=exports.getMatches=(async()=>{const e=await u.connect(),t=await e.query("\n    SELECT *\n    FROM matches\n    ORDER BY created_at ASC\n  ");return await e.release(),t.rows}),T=exports.getMigrations=(async()=>{const e=await u.connect(),t=await e.query("\n    CREATE TABLE IF NOT EXISTS migrations (\n      name VARCHAR NOT NULL UNIQUE PRIMARY KEY,\n      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP\n    );\n    SELECT * FROM migrations ORDER BY created_at ASC\n  ");return await e.release(),t[1].rows}),d=exports.getLadder=(async()=>{const e=await u.connect(),t=await e.query('\n    SELECT "name", "rating"\n    FROM players\n    ORDER BY "rating" DESC\n  ');return await e.release(),t.rows}),N=exports.runMigrationScript=(async e=>{const t=c.default.readFileSync(o.default.join(__dirname,"../db/sql",e),"utf8"),a=await u.connect();await a.query(t),await a.release()});
},{}],"VO5s":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var e=require("./postgres");Object.keys(e).forEach(function(r){"default"!==r&&"__esModule"!==r&&Object.defineProperty(exports,r,{enumerable:!0,get:function(){return e[r]}})});
},{"./postgres":"PTgE"}],"oRGX":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.runMigrationScripts=c;var n=require("pg"),e=require("../api"),t=require("arpad"),a=r(t);function r(n){return n&&n.__esModule?n:{default:n}}const i=new a.default,o=new n.Pool({connectionString:process.env.DATABASE_URL,ssl:"production"===process.env.NODE_ENV}),s={"20181018_add_score_columns":async()=>{await(0,e.runMigrationScript)("20181018_add_score_columns.sql");const n=await(0,e.getMatches)();for(const t of n){const n=await(0,e.getPlayer)(t.winner),a=await(0,e.getPlayer)(t.loser),r=i.newRatingIfWon(n.rating,a.rating),s=i.newRatingIfLost(a.rating,n.rating);console.log(`updating match ${t.id}: ${t.winner} -> ${r}; ${t.loser} -> ${s}`);const c=await o.connect(),u={name:"update-rating",text:'\n                UPDATE "matches"\n                SET "winner_rating"=$2, "loser_rating"=$3\n                WHERE "id"=$1\n              ',values:[t.id,r,s]};await c.query(u),await c.release()}}};async function c(){const n=await(0,e.getMigrations)();for(const e of Object.keys(s))n.find(({name:n})=>n===e)||await s[e]()}
},{"../api":"VO5s"}],"htcU":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.removeImage=exports.saveImage=void 0;var e=require("fs"),t=s(e);function s(e){return e&&e.__esModule?e:{default:e}}const r="./uploads/",a=()=>{t.default.existsSync(r)||t.default.mkdirSync(r)},n=exports.saveImage=(async e=>new Promise((s,a)=>{t.default.existsSync(r)||t.default.mkdirSync(r);const n=`./uploads/${`screenshot_${Date.now()}.jpg`}`;t.default.writeFile(n,e,e=>{if(e)return a(e);s(n)})})),u=exports.removeImage=(e=>{if(t.default.existsSync(r))return t.default.unlinkSync(e)});
},{}],"jWsf":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var e=require("./image-utils");Object.keys(e).forEach(function(t){"default"!==t&&"__esModule"!==t&&Object.defineProperty(exports,t,{enumerable:!0,get:function(){return e[t]}})});
},{"./image-utils":"htcU"}],"lY9v":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var e=require("express"),t=m(e),a=require("path"),s=m(a),n=require("cors"),r=m(n),o=require("body-parser"),i=m(o),l=require("lodash.uniq"),c=m(l),u=require("lodash.flatten"),d=m(u),p=require("./api"),f=require("./utils"),g=require("arpad"),y=m(g);function m(e){return e&&e.__esModule?e:{default:e}}const h=new y.default,R=(0,t.default)();R.use((0,r.default)()),R.use(i.default.json()),R.use(i.default.urlencoded({extended:!0})),R.use(t.default.static("dist/client")),R.post("/api/match",async(e,t)=>{console.info("POST /api/match");const{text:a}=e.body;if(!a)return t.sendStatus(400);const s=a.split(" ").filter(e=>Boolean(e.trim())).map(e=>e.toLowerCase().trim().replace(/[^a-z_]/gi,""));if(2!==s.length)return t.sendStatus(400);const n=await(0,p.getPlayer)(s[0]),r=await(0,p.getPlayer)(s[1]),o=h.newRatingIfWon(n.rating,r.rating),i=h.newRatingIfLost(r.rating,n.rating);try{await(0,p.postMatch)({name:n.name,rating:o},{name:r.name,rating:i}),t.status(200).json({text:`Got it, ${n.name.replace(/_{1,}/gi," ")} won ${r.name.replace(/_{1,}/gi," ")} 🏆 \n _ps. notify luffis if you made a mistake_`})}catch(e){console.error("[ERROR]",e),t.sendStatus(500)}}),R.get("/api/matches",async(e,t)=>{console.info("GET /api/matches");try{const e=await(0,p.getMatches)();t.status(200).json(e)}catch(e){console.error("[ERROR]",e),t.sendStatus(500)}}),R.post("/api/ladder",async(e,t)=>{let a;console.info("POST /api/ladder");try{a=await(0,p.getLadder)()}catch(e){return console.error("[ERROR]",e),t.sendStatus(500)}t.status(200).json({text:">>> \n"+a.map((e,t)=>`${t+1}. ${e.name}${0===t?" 👑":""}`).join("\n")})}),R.get("/api/ladder",async(e,t)=>{console.info("GET /api/ladder");try{const e=await(0,p.getLadder)();t.status(200).json(e)}catch(e){return console.error("[ERROR]",e),t.sendStatus(500)}}),R.get("/api/players",async(e,t)=>{let a;console.info("GET /api/players");try{a=await(0,p.getMatches)()}catch(e){return console.error("[ERROR]",e),t.sendStatus(500)}const s=(0,c.default)((0,d.default)(a.map(e=>[e.winner,e.loser]))).sort();t.status(200).json(s)}),R.post("/api/whoisit",async(e,t)=>{console.log("POST /api/whoisit"),t.json({players:[]})}),R.get("/api/foobar",async(e,t)=>{t.json(await(0,p.getMigrations)())}),R.get("*",(e,t)=>{t.sendFile(s.default.resolve(__dirname+"/../dist/client/index.html"))}),exports.default=R;
},{"./api":"VO5s","./utils":"jWsf"}],"Focm":[function(require,module,exports) {
require("babel-register")({});const e=require("./db/run-migrations").runMigrationScripts,r=require("./App").default,i=process.env.PORT||3e3;e().then(()=>{r.listen(i,()=>{console.log(`Server listening port -> ${i}`)})});
},{"./db/run-migrations":"oRGX","./App":"lY9v"}]},{},["Focm"], null)