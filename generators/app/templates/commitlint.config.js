module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nueva funcionalidad
        'fix',      // Corrección de bugs
        'docs',     // Documentación
        'style',    // Formateo, espacios, etc.
        'refactor', // Refactorización de código
        'test',     // Tests
        'chore',    // Tareas de mantenimiento
        'perf',     // Mejoras de rendimiento
        'ci',       // Cambios en CI/CD
        'build',    // Cambios en build system
        'revert'    // Revert de commits
      ]
    ],
    'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],
    'subject-max-length': [2, 'always', 72],
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [2, 'always']
  }
};
