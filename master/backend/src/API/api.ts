import express from "express"
import { ConsoleLogger } from "../logger";

const logger = new ConsoleLogger("API")

const app = express()
app.use(express.json());

//todo if cors problems occurs
// var cors = require('cors');
// app.use(cors({ origin: '*', credentials: true }));

//Import router form case.ts
import caseRouter from './routes/case'
app.use('/api', caseRouter);

//Import router form clock.ts
import clockRouter from './routes/clock'
app.use('/api', clockRouter);

//Import router form connected-modules.ts
import connectedModulesRouter from './routes/connected-modules'
app.use('/api', connectedModulesRouter);

//Import router form simon-says.ts
import simonSaysRouter from './routes/simon-says'
app.use('/api', simonSaysRouter);

//Import router form wires.ts
import wiresRouter from './routes/wires'
app.use('/api', wiresRouter);

//Import router from play-config.ts
import playConfigRouter from './routes/play_config'
app.use('/api', playConfigRouter);

//Import router from play_config_case.ts
import playConfigCaseRouter from './routes/play_config_case'
app.use('/api', playConfigCaseRouter);

//Import router from mazes.ts
import mazesRouter from './routes/mazes'
app.use('/api', mazesRouter);

//Import router from set_game_state.ts
import setGameStateRouter from './routes/set_game_state'
app.use('/api', setGameStateRouter);

//Import router from play_config_wires.ts
import playConfigWiresRouter from './routes/play_config_wires'
app.use('/api', playConfigWiresRouter);


const port = process.env.PORT || 3000; //TODO move to config file

export default function start() {
    app.listen(port, () => logger.log(`Listening on port ${port}...`));
}
