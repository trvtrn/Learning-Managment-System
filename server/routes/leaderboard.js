const express = require('express');
const { authenticate } = require('../utils/helpers');
const controller = require('../controllers/leaderboardController');

const router = express.Router();

/**
 * Each of the endpoints below return an error if:
 * - request is not authenticated
 * - user is not authorised to perform the operation
 * - course does not exist
 * - achievement does not exist (where relevant)
 * - user does not exist (where relevant)
 */

/**
 * Returns the students of the course in ranking order by achievement counts.
 * Inputs:
 * - courseId: number
 * Outputs:
 * - array of
 *   - rank: number,
 *   - userId: number,
 *   - firstName: string,
 *   - lastName: string,
 *   - email: string,
 *   - gold: number,
 *   - silver: number,
 *   - bronze: number
 */
router.get('/:courseId/overview', authenticate, controller.getLeaderboardOverviewHandler);

/**
 * Returns the details of all achievements owned by the requestor in the given course.
 * Inputs:
 * - courseId: number
 * Outputs:
 * - array of
 *   - achievementCode: string
 *   - achievementName: string
 *   - type: string
 */
router.get('/:courseId/user', authenticate, controller.getOwnAchievementsHandler);

/**
 * Returns the details of all achievements owned by the given user in the given course.
 * Inputs:
 * - courseId: number
 * - userId: number
 * Outputs:
 * - array of
 *   - achievementCode: string
 *   - achievementName: string
 *   - type: string
 */
router.get('/:courseId/user/:userId', authenticate, controller.getUserAchievementsHandler);

/**
 * Adds the given achievement to the requestor's achievement collection in the given course.
 * Fails if the requestor already owns the achievement.
 * Inputs:
 * - courseId: number
 * - achievementCode: string (code of achievement)
 * Outputs:
 * - achievementName: string
 * - type: 'Gold' | 'Silver' | 'Bronze'
 */
router.post('/:courseId/code', authenticate, controller.redeemAchievementHandler);

/**
 * Gets all achievements in the given course.
 * Inputs:
 * - courseId: number
 * Outputs:
 * - array of
 *   - achievementName: string
 *   - achievementCode: string
 *   - type: string
 */
router.get('/:courseId/achievements', authenticate, controller.getAllAchievementsHandler);

/**
 * Creates a new achievement in the given course, and returns its code.
 * Inputs:
 * - courseId: number
 * - achievementName: string
 * - type: string
 * Outputs:
 * - achievementCode: string (code of newly created achievement)
 */
router.post('/:courseId/achievements', authenticate, controller.createAchievementHandler);

/**
 * Deletes the given achievement from the given course.
 * All members who previously owned this achievement no longer do so.
 * Inputs:
 * - courseId: number
 * - achievementCode: string
 */
router.delete(
  '/:courseId/achievements/:achievementCode',
  authenticate,
  controller.deleteAchievementHandler
);

/**
 * Updates the details of the given achievement in the given course.
 * Inputs:
 * - courseId: number
 * - achievementCode: string
 * - achievementName: string
 * - type: string
 */
router.put(
  '/:courseId/achievements/:achievementCode',
  authenticate,
  controller.updateAchievementHandler
);

/**
 * Awards the given achievement to the user with given email in the given course.
 * Fails if the user already owns the achievement.
 * Inputs:
 * - courseId: number
 * - email: string
 * - achievementCode: string
 */
router.post('/:courseId/award', authenticate, controller.awardAchievementHandler);

module.exports = router;
