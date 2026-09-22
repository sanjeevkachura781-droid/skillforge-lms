import type { IncludeOptions } from 'sequelize';

export const courseOutlineInclude: IncludeOptions = {
  association: 'modules',
  separate: true,
  order: [['position', 'ASC']],
  include: [{ association: 'lessons', separate: true, order: [['position', 'ASC']] }],
};

export function quizQuestionsInclude(includeAnswers = false): IncludeOptions {
  return {
    association: 'questions',
    separate: true,
    order: [['position', 'ASC']],
    include: [{
      association: 'options',
      separate: true,
      order: [['position', 'ASC']],
      ...(includeAnswers ? {} : { attributes: ['id', 'optionText', 'position'] }),
    }],
  };
}
