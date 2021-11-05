import { take, takeLatest, put, spawn, retry, fork, delay, debounce } from 'redux-saga/effects';
import { searchSkillsRequest, searchSkillsSuccess, searchSkillsFailure, resetSearchField } from '../actions/actionCreators';
import { CHANGE_SEARCH_FIELD, SEARCH_SKILLS_REQUEST } from '../actions/actionTypes';
import { searchSkills } from '../api/index';

// function filterChangeSearchAction({type, payload}) {
//     return type === CHANGE_SEARCH_FIELD && payload.search.trim() !== ''
// }

// worker
function *handleChangeSearchSaga(action) {
    yield delay(100);
    yield put(searchSkillsRequest(action.payload.search));
}

// watcher
function* watchChangeSearchSaga() {
    while (true) {
      const action = yield take(CHANGE_SEARCH_FIELD);
          if (action.payload.search.trim() === '') {
            yield fork(handleResetSkillsSaga);
          } else {
              yield fork(handleChangeSearchSaga, action);
           }  
    }  
}

// worker
function* handleSearchSkillsSaga(action) {
    try {
        const retryCount = 3;
        const retryDelay = 1 * 1000; // ms
        const data = yield retry(retryCount, retryDelay, searchSkills, action.payload.search);
        yield put(searchSkillsSuccess(data));
    } catch (e) {
        yield put(searchSkillsFailure(e.message));
    }
}

// watcher
function* watchSearchSkillsSaga() {
    yield takeLatest(SEARCH_SKILLS_REQUEST, handleSearchSkillsSaga);
}

//worker
function* handleResetSkillsSaga() {
    yield put(resetSearchField());
}

export default function* saga() {
    yield spawn(watchChangeSearchSaga);
    yield spawn(watchSearchSkillsSaga)
}