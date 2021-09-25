<template>
  <div class="home-top">
    <header class="home-top__header">マイページ</header>
    <section class="home-top__new-event">
      <button class="home-top__new-event--button">
        <NuxtLink to="/room/create">
          <span class="material-icons"> add </span>新しいイベントを作成
        </NuxtLink>
      </button>
    </section>
    <section v-if="ongoingRooms.length > 0" class="home-top__event">
      <div class="home-top__event--title">開催中のイベント</div>
      <div v-for="(room, id) in ongoingRooms" :key="id">
        <NuxtLink
          :to="{ path: '/', query: { roomId: room.id, user: 'admin' } }"
          class="home-top__event--item"
        >
          <div class="home-top__event__list">
            <div class="home-top__event__list--name">{{ room.title }}</div>
            <div class="home-top__event__list--date">{{ room.startDate }}</div>
            <div class="home-top__event__list--role">管理者</div>
          </div>
        </NuxtLink>
      </div>
    </section>
    <section v-if="notStartedRooms.length > 0" class="home-top__event">
      <div class="home-top__event--title">未開始のイベント</div>
      <div v-for="(room, id) in notStartedRooms" :key="id">
        <NuxtLink
          :to="{ path: '/', query: { roomId: room.id, user: 'admin' } }"
          class="home-top__event--item"
        >
          <div class="home-top__event__list">
            <div class="home-top__event__list--name">{{ room.title }}</div>
            <div class="home-top__event__list--date">{{ room.startDate }}</div>
            <div class="home-top__event__list--role">管理者</div>
          </div>
        </NuxtLink>
      </div>
    </section>
    <section v-if="finishedRooms.length > 0" class="home-top__event">
      <div class="home-top__event--title">終了済みのイベント</div>
      <div v-for="(room, id) in finishedRooms" :key="id">
        <NuxtLink
          :to="{ path: '/', query: { roomId: room.id, user: 'admin' } }"
          class="home-top__event--item"
        >
          <div class="home-top__event__list">
            <div class="home-top__event__list--name">{{ room.title }}</div>
            <div class="home-top__event__list--date">{{ room.startDate }}</div>
            <div class="home-top__event__list--role">管理者</div>
            <div class="home-top__event__list--status">
              <button
                class="home-top__event__list--status--label"
                @click.prevent="onClickArchive(room.id)"
              >
                公開停止
              </button>
            </div>
          </div>
        </NuxtLink>
      </div>
    </section>
    <section class="home-top__inquiry">
      <div class="home-top__inquiry--title">お問い合わせ</div>
      <div class="home-top__inquiry--content">
        <a
          href="https://forms.gle/mSSiZNMgEkp174oo9"
          target="_blank"
          rel="noopener noreferrer"
        >
          Google Form
        </a>
        または
        <a
          href="https://twitter.com/osushi_academy"
          target="_blank"
          rel="noopener noreferrer"
        >
          Twitter
        </a>
        のDM
      </div>
    </section>
    <section class="home-top__account">
      <div class="home-top__account--title">アカウント</div>
      <div class="home-top__account--content">
        <div class="home-top__account--name">
          <div class="home-top__account--name--description">
            ログイン中のアカウント：
          </div>
          <div class="home-top__account--name--mail">
            {{ email }}
          </div>
        </div>
        <button class="home-top__account--logout-button" @click="logout()">
          ログアウト
        </button>
      </div>
    </section>
    <section class="home-top__other">
      <div class="home-top__other--title">その他</div>
      <div class="home-top__other--delete-button">アカウント削除</div>
    </section>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import { RoomModel } from "sushi-chat-shared"
import { DeviceStore, AuthStore } from "~/store"

type AsyncDataType = {
  ongoingRooms: RoomModel[]
  notStartedRooms: RoomModel[]
  finishedRooms: RoomModel[]
}

export default Vue.extend({
  name: "Home",
  layout: "home",
  middleware: "privateRoute",
  async asyncData({ app }): Promise<AsyncDataType> {
    const response = await app.$apiClient.get("/room", {})
    console.log(response)
    if (response.result === "success") {
      const rooms = response.data
      const ongoingRooms = rooms.filter((room) => room.state === "ongoing")
      const notStartedRooms = rooms.filter(
        (room) => room.state === "not-started",
      )
      const finishedRooms = rooms.filter((room) => room.state === "finished")

      return { ongoingRooms, notStartedRooms, finishedRooms }
    } else {
      // NOTE: エラーハンドリングを適切に
      throw new Error("データの取得に失敗しました")
    }
  },
  data(): AsyncDataType {
    return {} as AsyncDataType
  },
  computed: {
    email(): string | null {
      if (AuthStore.authUser != null) {
        return AuthStore.authUser.email
      }
      return ""
    },
  },
  mounted(): void {
    DeviceStore.determineOs()
  },
  methods: {
    async logout() {
      try {
        await this.$fire.auth.signOut()
        this.$router.push("/login")
      } catch {
        alert("ログアウトに失敗しました")
      }
    },
    async onClickArchive(id: string): Promise<void> {
      const continueArchive = window.confirm(
        "ルームをの公開を停止しますか？これ以降参加者・管理者ともにこのルームにアクセスすることはできません（チャット履歴の確認もできなくなります）。",
      )

      if (!continueArchive) {
        return
      }
      try {
        console.log(id)
        const response = await this.$apiClient.put(
          {
            pathname: "/room/:id/archive",
            params: { id },
          },
          {},
        )

        if (response.result === "success") {
          this.finishedRooms = this.finishedRooms.filter(
            (room) => room.id !== id,
          )
        } else {
          window.alert("ルームの公開停止に失敗しました")
        }
      } catch (e) {
        window.alert("ルームの公開停止に失敗しました")
      }
    },
  },
})
</script>
