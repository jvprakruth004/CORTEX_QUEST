/**
 * Cortex Quest - Modules and Submodules Configuration
 * 8 Modules, 24 Submodules total
 */

(function () {
  'use strict';

  var submoduleVarMap = {
    'arithmetic': 'QuestionsArithmetic',
    'quantitative': 'QuestionsQuantitative',
    'time-work': 'QuestionsTimeWork',
    'tables-charts': 'QuestionsTablesCharts',
    'graph-analysis': 'QuestionsGraphAnalysis',
    'caselet': 'QuestionsCaselet',
    'verbal-reasoning': 'QuestionsVerbalReasoning',
    'analytical-reasoning': 'QuestionsAnalyticalReasoning',
    'non-verbal': 'QuestionsNonVerbal',
    'science-tech': 'QuestionsScienceTech',
    'history-geo': 'QuestionsHistoryGeo',
    'current-affairs': 'QuestionsCurrentAffairs',
    'prog-fundamentals': 'QuestionsProgFundamentals',
    'control-statements': 'QuestionsControlStatements',
    'arrays-ds': 'QuestionsArraysDS',
    'operating-systems': 'QuestionsOperatingSystems',
    'dbms': 'QuestionsDBMS',
    'networks': 'QuestionsNetworks',
    'electrical': 'QuestionsElectrical',
    'mechanical': 'QuestionsMechanical',
    'eng-math': 'QuestionsEngMath',
    'anatomy': 'QuestionsAnatomy',
    'physiology': 'QuestionsPhysiology',
    'medical-science': 'QuestionsMedicalScience'
  };

  var modulesData = [
    {
      id: 'general-aptitude',
      name: 'General Aptitude',
      icon: 'bi-calculator',
      color: '#3A5311',
      accentColor: '#5c7a2e',
      gradient: 'linear-gradient(135deg, #3A5311, #7a9a5c)',
      bgmKey: 'general-aptitude',
      description: 'Master core arithmetic, commercial mathematics, time, work, speed, and numerical aptitude.',
      submodules: [
        {
          id: 'arithmetic',
          name: 'Arithmetic',
          icon: 'bi-plus-slash-minus',
          description: 'Basic arithmetic, fractions, decimals, percentages, and numerical ratios',
          questionsVar: 'QuestionsArithmetic'
        },
        {
          id: 'quantitative',
          name: 'Quantitative Aptitude',
          icon: 'bi-graph-up',
          description: 'Averages, profit & loss, simple and compound interest, mixtures, and speed',
          questionsVar: 'QuestionsQuantitative'
        },
        {
          id: 'time-work',
          name: 'Time and Work',
          icon: 'bi-clock',
          description: 'Work rate problems, worker efficiency, and pipes & cisterns',
          questionsVar: 'QuestionsTimeWork'
        }
      ]
    },
    {
      id: 'data-interpretation',
      name: 'Data Interpretation',
      icon: 'bi-bar-chart-line',
      color: '#2e5a44',
      accentColor: '#4f8c68',
      gradient: 'linear-gradient(135deg, #2e5a44, #5ba379)',
      bgmKey: 'data-interpretation',
      description: 'Analyze tables, graphs, pie charts, and paragraph-based statistical caselets.',
      submodules: [
        {
          id: 'tables-charts',
          name: 'Tables & Charts',
          icon: 'bi-table',
          description: 'Extract statistical insights, compute averages, and find percentage changes from tables',
          questionsVar: 'QuestionsTablesCharts'
        },
        {
          id: 'graph-analysis',
          name: 'Graph Analysis',
          icon: 'bi-pie-chart',
          description: 'Interpret bar graphs, line charts, trend slopes, and pie chart distributions',
          questionsVar: 'QuestionsGraphAnalysis'
        },
        {
          id: 'caselet',
          name: 'Caselet DI',
          icon: 'bi-journal-text',
          description: 'Synthesize data from descriptive text, passage scenarios, and sets',
          questionsVar: 'QuestionsCaselet'
        }
      ]
    },
    {
      id: 'logical-reasoning',
      name: 'Logical Reasoning',
      icon: 'bi-puzzle',
      color: '#435832',
      accentColor: '#6f8d48',
      gradient: 'linear-gradient(135deg, #435832, #88a85c)',
      bgmKey: 'logical-reasoning',
      description: 'Develop sharp cognitive reasoning across verbal patterns, puzzles, and visual sequences.',
      submodules: [
        {
          id: 'verbal-reasoning',
          name: 'Verbal Reasoning',
          icon: 'bi-chat-left-quote',
          description: 'Analogies, syllogisms, coding-decoding, and classification',
          questionsVar: 'QuestionsVerbalReasoning'
        },
        {
          id: 'analytical-reasoning',
          name: 'Analytical Reasoning',
          icon: 'bi-diagram-3',
          description: 'Seating arrangements, blood relations, directional paths, and ordering puzzles',
          questionsVar: 'QuestionsAnalyticalReasoning'
        },
        {
          id: 'non-verbal',
          name: 'Non-Verbal Reasoning',
          icon: 'bi-grid-3x3',
          description: 'Pattern completions, series deductions, mirror images, and matrix logic',
          questionsVar: 'QuestionsNonVerbal'
        }
      ]
    },
    {
      id: 'general-knowledge',
      name: 'General Knowledge',
      icon: 'bi-globe2',
      color: '#4d5218',
      accentColor: '#7d8531',
      gradient: 'linear-gradient(135deg, #4d5218, #9ca644)',
      bgmKey: 'general-knowledge',
      description: 'Explore scientific discoveries, historical milestones, global geography, and world affairs.',
      submodules: [
        {
          id: 'science-tech',
          name: 'Science & Technology',
          icon: 'bi-rocket-takeoff',
          description: 'Physics laws, chemistry fundamentals, space exploration, and breakthrough tech',
          questionsVar: 'QuestionsScienceTech'
        },
        {
          id: 'history-geo',
          name: 'History & Geography',
          icon: 'bi-compass',
          description: 'World history, civilizations, global capitals, mountain ranges, and rivers',
          questionsVar: 'QuestionsHistoryGeo'
        },
        {
          id: 'current-affairs',
          name: 'General & Global Affairs',
          icon: 'bi-newspaper',
          description: 'International treaties, prestigious awards, world organizations, and records',
          questionsVar: 'QuestionsCurrentAffairs'
        }
      ]
    },
    {
      id: 'programming',
      name: 'Programming',
      icon: 'bi-code-slash',
      color: '#1b4a3a',
      accentColor: '#367c64',
      gradient: 'linear-gradient(135deg, #1b4a3a, #479d7f)',
      bgmKey: 'programming',
      description: 'Master programming syntax, core paradigms, execution control flow, and fundamental data structures.',
      submodules: [
        {
          id: 'prog-fundamentals',
          name: 'Fundamentals',
          icon: 'bi-file-earmark-code',
          description: 'Variables, primitive types, operators, functions, scope, and OOP principles',
          questionsVar: 'QuestionsProgFundamentals'
        },
        {
          id: 'control-statements',
          name: 'Control Flow',
          icon: 'bi-arrow-repeat',
          description: 'Conditionals, switch cases, loops, recursion, and output prediction',
          questionsVar: 'QuestionsControlStatements'
        },
        {
          id: 'arrays-ds',
          name: 'Arrays & Data Structures',
          icon: 'bi-layers',
          description: 'Arrays, stacks, queues, linked lists, trees, searching, and Big-O notation',
          questionsVar: 'QuestionsArraysDS'
        }
      ]
    },
    {
      id: 'computer-science',
      name: 'Computer Science',
      icon: 'bi-cpu',
      color: '#24483a',
      accentColor: '#41735d',
      gradient: 'linear-gradient(135deg, #24483a, #549479)',
      bgmKey: 'computer-science',
      description: 'Delve into system-level architecture, relational databases, and network protocols.',
      submodules: [
        {
          id: 'operating-systems',
          name: 'Operating Systems',
          icon: 'bi-terminal',
          description: 'Processes, concurrency, scheduling algorithms, memory paging, and deadlocks',
          questionsVar: 'QuestionsOperatingSystems'
        },
        {
          id: 'dbms',
          name: 'DBMS & SQL',
          icon: 'bi-database',
          description: 'SQL queries, normalization (1NF-BCNF), ACID properties, and relational indexing',
          questionsVar: 'QuestionsDBMS'
        },
        {
          id: 'networks',
          name: 'Computer Networks',
          icon: 'bi-hdd-network',
          description: 'OSI 7 layers, TCP/IP, IP subnetting, DNS, routing protocols, and security',
          questionsVar: 'QuestionsNetworks'
        }
      ]
    },
    {
      id: 'engineering',
      name: 'Engineering',
      icon: 'bi-gear-wide-connected',
      color: '#464919',
      accentColor: '#797e33',
      gradient: 'linear-gradient(135deg, #464919, #9da248)',
      bgmKey: 'engineering',
      description: 'Foundational concepts in electrical systems, mechanical mechanics, and engineering calculus.',
      submodules: [
        {
          id: 'electrical',
          name: 'Electrical Engineering',
          icon: 'bi-lightning-charge',
          description: "Ohm's & Kirchhoff's laws, AC/DC circuit analysis, inductors, and power factor",
          questionsVar: 'QuestionsElectrical'
        },
        {
          id: 'mechanical',
          name: 'Mechanical Engineering',
          icon: 'bi-tools',
          description: 'Laws of thermodynamics, fluid dynamics, stress-strain curves, and gear ratios',
          questionsVar: 'QuestionsMechanical'
        },
        {
          id: 'eng-math',
          name: 'Engineering Math',
          icon: 'bi-infinity',
          description: 'Calculus, eigenvalues & matrices, differential equations, and Laplace transforms',
          questionsVar: 'QuestionsEngMath'
        }
      ]
    },
    {
      id: 'medical',
      name: 'Medical Science',
      icon: 'bi-heart-pulse',
      color: '#274b33',
      accentColor: '#497c58',
      gradient: 'linear-gradient(135deg, #274b33, #609d72)',
      bgmKey: 'medical',
      description: 'Comprehensive study of human anatomy, organ physiology, pathogens, and pharmacology.',
      submodules: [
        {
          id: 'anatomy',
          name: 'Human Anatomy',
          icon: 'bi-person-arms-up',
          description: 'Skeletal systems, major organs, cranial nerves, and cardiovascular structures',
          questionsVar: 'QuestionsAnatomy'
        },
        {
          id: 'physiology',
          name: 'Human Physiology',
          icon: 'bi-activity',
          description: 'Action potentials, endocrine hormones, renal filtration, and pulmonary gas exchange',
          questionsVar: 'QuestionsPhysiology'
        },
        {
          id: 'medical-science',
          name: 'Clinical & Medical Science',
          icon: 'bi-capsule',
          description: 'Infectious diseases, immunology & vaccines, pharmacology, and emergency first aid',
          questionsVar: 'QuestionsMedicalScience'
        }
      ]
    }
  ];

  window.CortexModulesData = {
    modules: modulesData,

    getModule: function (id) {
      if (!id) return null;
      for (var i = 0; i < this.modules.length; i++) {
        if (this.modules[i].id === id) {
          return this.modules[i];
        }
      }
      return null;
    },

    getSubmodule: function (moduleId, submoduleId) {
      var mod = this.getModule(moduleId);
      if (mod && mod.submodules) {
        for (var i = 0; i < mod.submodules.length; i++) {
          if (mod.submodules[i].id === submoduleId) {
            return mod.submodules[i];
          }
        }
      }
      // If moduleId was omitted or submodule not found under moduleId, search all
      for (var j = 0; j < this.modules.length; j++) {
        for (var k = 0; k < this.modules[j].submodules.length; k++) {
          if (this.modules[j].submodules[k].id === submoduleId) {
            return this.modules[j].submodules[k];
          }
        }
      }
      return null;
    },

    getAllSubmodules: function () {
      var all = [];
      for (var i = 0; i < this.modules.length; i++) {
        var mod = this.modules[i];
        for (var j = 0; j < mod.submodules.length; j++) {
          var sub = mod.submodules[j];
          all.push({
            id: sub.id,
            name: sub.name,
            icon: sub.icon,
            description: sub.description,
            questionsVar: sub.questionsVar,
            moduleId: mod.id,
            moduleName: mod.name,
            moduleColor: mod.color,
            moduleGradient: mod.gradient,
            bgmKey: mod.bgmKey
          });
        }
      }
      return all;
    },

    getQuestionsForSubmodule: function (submoduleId) {
      if (!submoduleId) return [];
      var varName = submoduleVarMap[submoduleId];
      if (varName && window[varName] && Array.isArray(window[varName])) {
        return window[varName];
      }
      // Fallback: try camelCase
      var fallbackName = 'Questions' + submoduleId.split('-').map(function (part) {
        return part.charAt(0).toUpperCase() + part.slice(1);
      }).join('');
      if (window[fallbackName] && Array.isArray(window[fallbackName])) {
        return window[fallbackName];
      }
      return [];
    }
  };
})();
