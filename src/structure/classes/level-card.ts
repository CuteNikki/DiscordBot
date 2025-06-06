import { Builder, JSX as CanvacordJSX, Font, FontFactory, StyleSheet } from 'canvacord';
import { type JSX } from 'react';

import { statusColors } from 'constants/canvacord';

import type { CardPropsType, RankCardProps } from 'types/canvacord';

export class RankCard extends Builder {
  props: RankCardProps;

  constructor(props: CardPropsType) {
    super(930, 280); // width, height

    this.props = {
      ...props,
      abbreviate: props.abbreviate ?? true,
      styles: {
        ...props.styles
      },
      texts: {
        ...props.texts
      }
    };

    if (!FontFactory.size) {
      Font.loadDefault();
    }
  }

  async render() {
    const { rank, level, currentXP, requiredXP, abbreviate, username, handle, avatar, status, styles, texts, backgroundColor } = this.props;

    const clamp = (value: number) => Math.max(0, Math.min(100, value));
    const progress = Math.round(((currentXP ?? 0) / (requiredXP ?? 0)) * 100);
    const progressWidth = typeof progress !== 'number' || Number.isNaN(progress) ? 0 : clamp(progress);
    const fixed = (v: number, r: boolean) => {
      if (!r) return v;
      const formatter = new Intl.NumberFormat('en-US', { notation: 'compact' });
      return formatter.format(v);
    };

    return CanvacordJSX.createElement(
      'div',
      { className: 'flex h-full w-full p-6' },
      CanvacordJSX.createElement(
        'div',
        {
          className: StyleSheet.cn(
            backgroundColor && !backgroundColor.startsWith('url(') ? `bg-[${backgroundColor}]` : 'bg-[#2b2f35]',
            'flex items-center rounded-2xl h-full w-full px-4',
            StyleSheet.tw(styles.overlay)
          ),
          style: StyleSheet.compose(
            {
              backgroundImage: backgroundColor?.startsWith('url(') ? backgroundColor : undefined,
              backgroundSize: backgroundColor?.startsWith('url(') ? '100% 100%' : undefined
            },
            StyleSheet.css(styles.background)
          )
        },
        CanvacordJSX.createElement(
          'div',
          {
            className: StyleSheet.cn('flex relative', StyleSheet.tw(styles.avatar?.container)),
            style: StyleSheet.css(styles.avatar?.container)
          },
          avatar
            ? CanvacordJSX.createElement('img', {
                alt: 'avatar',
                src: avatar,
                className: StyleSheet.cn('h-38 w-38 rounded-full ml-4', StyleSheet.tw(styles.avatar?.image))
              })
            : CanvacordJSX.createElement('div', { className: StyleSheet.cn('h-38 w-38 rounded-full ml-4', StyleSheet.tw(styles.avatar?.image)) }),
          status
            ? status !== 'none'
              ? CanvacordJSX.createElement('div', {
                  className: StyleSheet.cn(
                    'absolute h-8 w-8 rounded-full bottom-5 right-0 flex',
                    `bg-[${statusColors[status]}]`,
                    StyleSheet.tw(styles.avatar?.status)
                  ),
                  style: StyleSheet.css(styles.avatar?.status)
                })
              : CanvacordJSX.createElement('div', { className: 'hidden ' })
            : CanvacordJSX.createElement('div', { className: 'hidden' })
        ),
        CanvacordJSX.createElement(
          'div',
          {
            className: StyleSheet.cn('flex flex-col ml-8', StyleSheet.tw(styles.container)),
            style: StyleSheet.css(styles.container)
          },
          CanvacordJSX.createElement(
            'div',
            {
              className: StyleSheet.cn('flex flex-col', StyleSheet.tw(styles.username?.container)),
              style: StyleSheet.css(styles.username?.container)
            },
            username
              ? CanvacordJSX.createElement(
                  'h1',
                  {
                    className: StyleSheet.cn('text-white font-semibold text-3xl mb-0', StyleSheet.tw(styles.username?.name), !handle ? 'mb-2' : ''),
                    style: StyleSheet.css(styles.username?.name)
                  },
                  username as unknown as JSX.Element
                )
              : CanvacordJSX.createElement('div', { className: 'hidden' }),
            handle
              ? CanvacordJSX.createElement(
                  'p',
                  {
                    className: StyleSheet.cn('text-[#808386] font-semibold text-lg mt-0', StyleSheet.tw(styles.username?.handle)),
                    style: StyleSheet.css(styles.username?.handle)
                  },
                  handle as unknown as JSX.Element
                )
              : CanvacordJSX.createElement('div', { className: 'hidden' })
          ),
          CanvacordJSX.createElement(
            'div',
            {
              className: StyleSheet.cn('flex relative', StyleSheet.tw(styles.progressbar?.container)),
              style: StyleSheet.css(styles.progressbar?.container)
            },
            CanvacordJSX.createElement(
              'div',
              {
                className: StyleSheet.cn('bg-[#484b4e] w-160 h-6 rounded-xl flex', StyleSheet.tw(styles.progressbar?.track)),
                style: StyleSheet.css(styles.progressbar?.track)
              },
              CanvacordJSX.createElement('div', {
                className: StyleSheet.cn('bg-[#fff] max-w-160 h-6 rounded-xl absolute flex', `w-[${progressWidth}%]`, StyleSheet.tw(styles.progressbar?.thumb)),
                style: StyleSheet.css(styles.progressbar?.thumb)
              })
            )
          ),
          CanvacordJSX.createElement(
            'div',
            {
              className: StyleSheet.cn('flex', StyleSheet.tw(styles.statistics?.container)),
              style: StyleSheet.css(styles.statistics?.container)
            },
            level != null
              ? CanvacordJSX.createElement(
                  'div',
                  {
                    className: StyleSheet.cn('flex items-center text-[#808386] font-medium', StyleSheet.tw(styles.statistics?.level?.container)),
                    style: StyleSheet.css(styles.statistics?.level?.container)
                  },
                  CanvacordJSX.createElement(
                    'h3',
                    {
                      className: StyleSheet.tw(styles.statistics?.level?.text),
                      style: StyleSheet.css(styles.statistics?.level?.text)
                    },
                    (texts.level || 'LEVEL:') as unknown as JSX.Element
                  ),
                  CanvacordJSX.createElement(
                    'span',
                    {
                      className: StyleSheet.cn('text-white ml-1', StyleSheet.tw(styles.statistics?.level?.value)),
                      style: StyleSheet.css(styles.statistics?.level?.value)
                    },
                    fixed(level, abbreviate) as unknown as JSX.Element
                  )
                )
              : CanvacordJSX.createElement('div', { className: 'hidden ' }),
            currentXP != null
              ? CanvacordJSX.createElement(
                  'div',
                  {
                    className: StyleSheet.cn('flex items-center text-[#808386] font-medium ml-8', StyleSheet.tw(styles.statistics?.xp?.container)),
                    style: StyleSheet.css(styles.statistics?.xp?.container)
                  },
                  CanvacordJSX.createElement(
                    'h3',
                    {
                      className: StyleSheet.tw(styles.statistics?.xp?.text),
                      style: StyleSheet.css(styles.statistics?.xp?.text)
                    },
                    (texts.xp || 'XP:') as unknown as JSX.Element
                  ),
                  CanvacordJSX.createElement(
                    'span',
                    {
                      className: StyleSheet.cn('text-white ml-1', StyleSheet.tw(styles.statistics?.xp?.value)),
                      style: StyleSheet.css(styles.statistics?.xp?.value)
                    },
                    fixed(currentXP, abbreviate) as unknown as JSX.Element
                  )
                )
              : CanvacordJSX.createElement('div', { className: 'hidden' }),
            rank != null
              ? CanvacordJSX.createElement(
                  'div',
                  {
                    className: StyleSheet.cn('flex items-center text-[#808386] font-medium ml-8', StyleSheet.tw(styles.statistics?.xp?.container)),
                    style: StyleSheet.css(styles.statistics?.xp?.container)
                  },
                  CanvacordJSX.createElement(
                    'h3',
                    {
                      className: StyleSheet.tw(styles.statistics?.xp?.text),
                      style: StyleSheet.css(styles.statistics?.xp?.text)
                    },
                    (texts.rank || 'RANK:') as unknown as JSX.Element
                  ),
                  CanvacordJSX.createElement(
                    'span',
                    {
                      className: StyleSheet.cn('text-white ml-1', StyleSheet.tw(styles.statistics?.xp?.value)),
                      style: StyleSheet.css(styles.statistics?.xp?.value)
                    },
                    fixed(rank, abbreviate) as unknown as JSX.Element
                  )
                )
              : CanvacordJSX.createElement('div', { className: 'hidden ' })
          )
        )
      )
    ) as JSX.Element;
  }
}
