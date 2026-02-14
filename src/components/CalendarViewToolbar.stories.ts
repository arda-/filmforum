import CalendarViewToolbar from './CalendarViewToolbar.astro';

export default {
  component: CalendarViewToolbar,
};

export const Default = {
  args: {},
};

export const TimelineView = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Default state with Timeline view selected',
      },
    },
  },
};

export const GridView = {
  args: {
    viewMode: 'grid',
  },
  parameters: {
    docs: {
      description: {
        story: 'Grid/Rows view mode',
      },
    },
  },
};

export const FitWidth = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Fit to window width mode (default)',
      },
    },
  },
};

export const ContentWidth = {
  args: {
    widthMode: 'content',
  },
  parameters: {
    docs: {
      description: {
        story: 'Content width mode with details enabled',
      },
    },
  },
};

export const WithYearDirector = {
  args: {
    widthMode: 'content',
    showYearDirector: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Detail toggle: Year & Director enabled',
      },
    },
  },
};

export const WithRuntime = {
  args: {
    widthMode: 'content',
    showRuntime: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Detail toggle: Runtime enabled',
      },
    },
  },
};

export const WithCast = {
  args: {
    widthMode: 'content',
    showCast: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Detail toggle: Cast enabled',
      },
    },
  },
};

export const WithImage = {
  args: {
    widthMode: 'content',
    showImage: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Detail toggle: Poster image enabled',
      },
    },
  },
};

export const AllDetailsEnabled = {
  args: {
    widthMode: 'content',
    showYearDirector: true,
    showRuntime: true,
    showCast: true,
    showImage: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'All detail toggles enabled (Year & Director, Runtime, Cast, Image)',
      },
    },
  },
};

export const WeekStartMonday = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Week start preference: Monday (default, accessible via gear menu)',
      },
    },
  },
};

export const WeekStartSunday = {
  args: {
    weekStart: 'sun',
  },
  parameters: {
    docs: {
      description: {
        story: 'Week start preference: Sunday (accessible via gear menu)',
      },
    },
  },
};

export const GearMenuOpen = {
  args: {
    gearOpen: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Settings popover open, showing week start and highlighting options',
      },
    },
  },
};
