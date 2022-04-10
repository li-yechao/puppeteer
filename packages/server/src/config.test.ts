// Copyright 2022 LiYechao
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { ConfigService } from '@nestjs/config'
import { Test } from '@nestjs/testing'
import { Config } from './config'

describe('Config', () => {
  let config: Config
  let configService: { get: jest.Mock }

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      providers: [Config, { provide: ConfigService, useFactory: () => ({ get: jest.fn() }) }],
    }).compile()

    config = mod.get(Config)
    configService = mod.get(ConfigService)
  })

  test('port', () => {
    // default `port`
    configService.get.mockReturnValueOnce(undefined)
    expect(config.port).toEqual(8080)

    // default `port`
    configService.get.mockReturnValueOnce(null)
    expect(config.port).toEqual(8080)

    // default `port`
    configService.get.mockReturnValueOnce('')
    expect(config.port).toEqual(8080)

    // default `port`
    configService.get.mockReturnValueOnce(' ')
    expect(config.port).toEqual(8080)

    configService.get.mockReturnValueOnce('8181')
    expect(config.port).toEqual(8181)

    configService.get.mockReturnValueOnce('abc')
    expect(() => config.port).toThrow(/invalid/i)
  })

  test('cors', () => {
    // default `cors`
    configService.get.mockReturnValueOnce(undefined)
    expect(config.cors).toEqual(false)

    configService.get.mockReturnValueOnce('false')
    expect(config.cors).toEqual(false)

    configService.get.mockReturnValueOnce('true')
    expect(config.cors).toEqual(true)
  })
})
